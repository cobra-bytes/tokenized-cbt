import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Hash "mo:base/Hash";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Random "mo:base/Random";
import Blob "mo:base/Blob";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Prelude "mo:base/Prelude";
import Buffer "mo:base/Buffer";

actor Token {
  var owner : Principal = Principal.fromText("ecraa-frqon-vthzt-dkvve-gnydz-or7bd-sg7i7-koi7h-ygjof-njmov-xqe");
  var adminadmin : Principal = Principal.fromText("ecraa-frqon-vthzt-dkvve-gnydz-or7bd-sg7i7-koi7h-ygjof-njmov-xqe");
  var totalSupply : Nat = 100000000;
  var symbol : Text = "CBT";

  type Transaction = {
    date_time : Int;
    info : Text;
    sign : Text;
    amount : Nat;
    status : Text;
  };

  type StudentProfile = {
    student_id : Text;
    full_name : Text;
    email : Text;
    program : Text;
  };

  type StudentType = {
    principal: Principal;
    profile: StudentProfile;
  };

  type BalanceWithHistory = {
    balance : Nat;
    history : [Transaction];
  };
  
  type TransactionBalances = {
    profile: StudentProfile;
    principal: Principal;
    balanceHistory: BalanceWithHistory;
  };

  type AdminProfile = {
    full_name : Text;
    email : Text;
  };

  type Message = {
    mtype : Text;
    msg : Text;
  };

  private stable var adminsEntries: [(Principal, AdminProfile)] = [];
  private var admins = HashMap.HashMap<Principal, AdminProfile>(1, Principal.equal, Principal.hash);

  public query func seeAllTransactions(): async [TransactionBalances] {
    var result: [TransactionBalances] = [];
    for ((principals, balance) in balances.entries()) {
      let prof = switch (profiles.get(principals)) {
        case null ({ student_id = ""; full_name = ""; email = ""; program = "" });
        case (?p) (p);
      };
      result := Array.append<TransactionBalances>(result, [{
        profile = prof;
        principal = principals;
        balanceHistory = balance;
      }])
    };
    return result;
  };

  public func isAdmin(who: Principal): async Bool{
    switch (admins.get(who)) {
      case null return false;
      case (?adminHere) return true;
    };
  };

  public query func getAdminProfile(principal: Principal): async (Principal, AdminProfile) {
    if (Principal.isAnonymous(principal)) {
      return (principal, { full_name = ""; email = "" });
    } else {
      let profile = switch (admins.get(principal)) {
        case null (principal,  { full_name = ""; email = "" });
        case (?p) (principal, p);
      };
      return profile;
    }
  };
  
  public shared({caller}) func addIncentive(to: Principal, amount : Nat) : async Message {
    if (Principal.isAnonymous(caller)) {
      return {
        mtype = "error";
        msg = "Please Login First";
      }
    } else {
      let admin = await isAdmin(caller);
      if(admin) {
        let result = await transfer(to, amount);
        return result;
      } else {
        return {
          mtype = "error";
          msg = "You are not authorized to perform this";
        }
      }
    }
  };

  public query func seeAllAdmins(): async [(Principal, AdminProfile)] {
    return Iter.toArray(admins.entries());
  };

  public query func seeAllClaimedTransaction(): async [(Text, Principal)] {
    return Iter.toArray(claimedTransaction.entries());
  };
 
  public query func seeAllStudents(): async [StudentType] {
      var result:  [StudentType] = [];
      for ((principals, student) in profiles.entries()) {
          result := Array.append<StudentType>(result, [{
            principal = principals;
            profile = student;
          }])
      };
      return result;
  };
  
  private stable var balancesEntries: [(Principal, BalanceWithHistory)] = [];
  private stable var claimedFreeTokenEntries: [(Principal, Bool)] = [];
  private stable var profilesEntries: [(Principal, StudentProfile)] = [];
  private stable var claimedTransactionEntries: [(Text, Principal)] = [];

  private var balances = HashMap.HashMap<Principal, BalanceWithHistory>(1, Principal.equal, Principal.hash);
  private var profiles = HashMap.HashMap<Principal, StudentProfile>(1, Principal.equal, Principal.hash);
  private var claimedFreeToken = HashMap.HashMap<Principal, Bool>(0, Principal.equal, Principal.hash);
  private var claimedTransaction = HashMap.HashMap<Text, Principal>(0, Text.equal, Text.hash);

  if(admins.size() < 1){
    admins.put(adminadmin, {
      full_name = "Jhomar Candelario";
      email = "candelario.jhomar@clsu2.edu.ph";
    });
  };
  if(profiles.size() < 1){
    profiles.put(adminadmin, {
      student_id = "21-0211";
      full_name = "Jhomar Candelario";
      email = "candelario.jhomar@clsu2.edu.ph";
      program = "BSIT";
    });
  };

  if(balances.size() < 1){
    balances.put(owner, { 
      balance = totalSupply; 
      history = [{
        date_time = Time.now();
        info = "Initialized Supply";
        sign = "+";
        amount = totalSupply;
        status = "Approved"
      }]
    });
  };

  public func addProfile(who: Principal, profile: StudentProfile) : async Message {
    if (Principal.isAnonymous(who)) {
      return {
        mtype = "error";
        msg = "Please Login First";
      }
    } else {
      profiles.put(who, profile);
      return 
      {
          mtype = "success";
          msg = "Profile Updated";
      };
    };
  };
  
  public func makeClaimedTransaction(date: Text, who: Principal) : async Message {
    if (Principal.isAnonymous(who)) {
        return {
            mtype = "error";
            msg = "Please Login First";
        };
    } else {
        let claimed = claimedTransaction.get(date);
        if (claimed == null) {
            claimedTransaction.put(date, who);
            return {
                mtype = "success";
                msg = "Transaction Claimed";
            };
        } else {
            return {
                mtype = "error";
                msg = "Transaction already claimed";
            };
        }
    }
};


  public query func balanceOf(who: Principal): async Nat {
    if (Principal.isAnonymous(who)) {
      return 0;
    } else {
      let balancesHistory = switch (balances.get(who)) {
        case null 0;
        case (?result) result.balance;
      };
      return balancesHistory;
    }
  };

  public query func getProfile(principal: Principal): async (Principal, StudentProfile) {
    if (Principal.isAnonymous(principal)) {
      return (principal, { student_id = ""; full_name = ""; email = ""; program = "" });
    } else {
      let profile = switch (profiles.get(principal)) {
        case null (principal, { student_id = ""; full_name = ""; email = ""; program = "" });
        case (?p) (principal, p);
      };
      return profile;
    }
  };


  public query func historyOf(who: Principal): async [Transaction] {
    if (Principal.isAnonymous(who)) {
      return [];
    } else {
      let callerHistory = switch (balances.get(who)) {
        case null [];
        case (?result) result.history;
      };
      return callerHistory;
    }
  };

  public query func getSymbol(): async Text {
    return symbol;
  };

  public shared({caller}) func payOut(): async Message {
    if(Principal.isAnonymous(caller)){
      return {
        mtype = "error";
        msg = "Please Login First";
      }
    } else {
      if(claimedFreeToken.get(caller) == null){
        let amount = 10000;  
        let result = await payoutTransfer(caller, amount);
        return result;
      } else {
        return {
          mtype = "error";
          msg = "Already Claimed";
        }
      }
    };
  };
  
  
  public shared({caller}) func transfer(to: Principal, amount: Nat) : async Message {
    if(Principal.isAnonymous(caller)){
      return {
        mtype = "error";
        msg = "Please Login First";
      }
    } else {
      let fromBalance : Nat = await balanceOf(owner);
      if(fromBalance >= amount){
        let currentTime = Time.now();
        let newFromBalance : Nat = fromBalance - amount;
        let callerHistory = switch (balances.get(owner)) {
          case null [];
          case (?balancesHistory) balancesHistory.history;
        };

        let newCallerHistory = Array.append<Transaction>(callerHistory, [({
          date_time = currentTime; 
          info = "Transfered " # Nat.toText(amount) # " CBT to " # Principal.toText(to); 
          sign = "-";
          amount = amount;
          status = "Approved"
        })]);

        let newBalanceWithHistory = { balance = newFromBalance; history = newCallerHistory };
        balances.put(owner, newBalanceWithHistory);
        
        let toBalance = await balanceOf(to);
        let newToBalance = toBalance + amount;
        let callerHistoryTo = switch (balances.get(to)) {
          case null [];
          case (?balancesHistory) balancesHistory.history;
        };
        let newCallerHistoryTo = Array.append<Transaction>(callerHistoryTo, [({
          date_time = currentTime; 
          info = "Received"; 
          sign = "+"; 
          amount = amount;
          status = "Approved"
        })]);
        let newBalanceWithHistoryTo = { balance = newToBalance; history = newCallerHistoryTo };
        balances.put(to, newBalanceWithHistoryTo);

        return {
          mtype = "success";
          msg = "Success";
        }
      } else {
        return {
          mtype = "error";
          msg = "Insufficient Funds";
        }
      } 
    }
  };

  public shared({caller}) func payoutTransfer(to: Principal, amount: Nat) : async Message {
    if(Principal.isAnonymous(caller)){
      return {
        mtype = "error";
        msg = "Please Login First";
      }
    } else {
      let fromBalance : Nat = await balanceOf(owner);
      if(fromBalance >= amount){
        let currentTime = Time.now();
        let newFromBalance : Nat = fromBalance - amount;
        let callerHistory = switch (balances.get(owner)) {
          case null [];
          case (?balancesHistory) balancesHistory.history;
        };

        let newCallerHistory = Array.append<Transaction>(callerHistory, [({
          date_time = currentTime; 
          info = "Transfered " # Nat.toText(amount) # " CBT to " # Principal.toText(to); 
          sign = "-";
          amount = amount;
          status = "Approved"
        })]);

        let newBalanceWithHistory = { balance = newFromBalance; history = newCallerHistory };
        balances.put(owner, newBalanceWithHistory);
        
        let toBalance = await balanceOf(to);
        let newToBalance = toBalance + amount;
        let callerHistoryTo = switch (balances.get(to)) {
          case null [];
          case (?balancesHistory) balancesHistory.history;
        };
        let newCallerHistoryTo = Array.append<Transaction>(callerHistoryTo, [({
          date_time = currentTime; 
          info = "Received"; 
          sign = "+"; 
          amount = amount;
          status = "Approved"
        })]);
        let newBalanceWithHistoryTo = { balance = newToBalance; history = newCallerHistoryTo };
        balances.put(to, newBalanceWithHistoryTo);

        claimedFreeToken.put(to, true);
        return {
          mtype = "success";
          msg = "Success";
        }
      } else {
        return {
          mtype = "error";
          msg = "Insufficient Funds";
        }
      } 
    }
  };

  public shared({caller}) func withdraw(availed: Text, amount: Nat) : async Message {
    if(Principal.isAnonymous(caller)){
      return {
        mtype = "error";
        msg = "Please Login First";
      }
    } else {
      let fromBalance : Nat = await balanceOf(caller);
      if(fromBalance >= amount){
        let newFromBalance : Nat = fromBalance - amount;
        let callerHistory = switch (balances.get(caller)) {
          case null [];
          case (?balancesHistory) balancesHistory.history;
        };
        let newCallerHistory = Array.append<Transaction>(callerHistory, [({
          date_time = Time.now(); 
          info = "Redeemed " # availed; 
          sign = "-";
          amount = amount;
          status = "Pending";
        })]);

        let newBalanceWithHistory = { balance = newFromBalance; history = newCallerHistory };
        balances.put(caller, newBalanceWithHistory);
        return {
          mtype = "success";
          msg = "Success";
        }
      } else {
        return {
          mtype = "error";
          msg = "Insufficient Funds";
        }
      } 
    }
  };

  public shared({caller}) func whoAmI(): async Principal {
    return caller;
  };

  system func preupgrade() {
    balancesEntries := Iter.toArray(balances.entries());
    adminsEntries := Iter.toArray(admins.entries());
    profilesEntries := Iter.toArray(profiles.entries());
    claimedFreeTokenEntries := Iter.toArray(claimedFreeToken.entries());
    claimedTransactionEntries := Iter.toArray(claimedTransaction.entries());
  };

  system func postupgrade() {
    balances := HashMap.fromIter<Principal, BalanceWithHistory>(balancesEntries.vals(), 1, Principal.equal, Principal.hash);
    admins := HashMap.fromIter<Principal, AdminProfile>(adminsEntries.vals(), 1, Principal.equal, Principal.hash);
    profiles := HashMap.fromIter<Principal, StudentProfile>(profilesEntries.vals(), 1, Principal.equal, Principal.hash);
    if(admins.size() < 1){
       admins.put(adminadmin, {
        full_name = "Jhomar Candelario";
        email = "candelario.jhomar@clsu2.edu.ph";
      });
    };
    if(balances.size() < 1){
      balances.put(owner, { balance = totalSupply; history = [({
        date_time = Time.now(); info = "Initialized Supply"; 
        sign = "+";
        amount = totalSupply;
        status = "Approved"
      })]});
    };
    if(profiles.size() < 1){
      profiles.put(adminadmin, {
        student_id = "21-0211";
        full_name = "Jhomar Candelario";
        email = "candelario.jhomar@clsu2.edu.ph";
        program = "BSIT";
      });
    };
    claimedFreeToken := HashMap.fromIter<Principal, Bool>(claimedFreeTokenEntries.vals(), 0, Principal.equal, Principal.hash);
    claimedTransaction := HashMap.fromIter<Text, Principal>(claimedTransactionEntries.vals(), 0, Text.equal, Text.hash);
  };
}