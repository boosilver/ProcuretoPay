package main

import (
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type FundTransferChaincode struct {
}

//Init function
func (t *FundTransferChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

//All mapping function in chaincode
func (t *FundTransferChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	// fmt.Println("Fund_Transfer_Chaincode Invoke")
	function, args := stub.GetFunctionAndParameters()
	if function == "addmoney" {
		return t.AndAddmoney(stub, args)
	} else if function == "transfer" {
		return t.Transfer(stub, args)
	} else if function == "check" {
		return t.CheckBalance(stub, args)
	}else if function == "Createwallet" {
		return t.Createwallet(stub, args)
	}
	// else if function == "createInvoice" {
	// 	return t.CreateInvoice(stub, args)
	// }

	return shim.Error("Invalid invoke function name. ")
}

//Wallet
var Aval, Bval int
func (t *FundTransferChaincode) Createwallet(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var wallet string
	var User string
	var AvalN int
	var err error
	var numw int
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	//****
	wallet = args[0]
	User = args[2]
	Userkey := wallet+"$$$"+User

	numwallet, err := stub.GetState(User)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if numwallet == nil{
		err = stub.PutState(User, []byte(strconv.Itoa(1)))
			if err != nil {
			return shim.Error(err.Error())
			}
			if err != nil {
			return shim.Error("Expecting integer value for asset holding")
			}
	}else{
		numw, err = strconv.Atoi(string(numwallet))
		if err != nil {
			return shim.Error("can't chang to int")
		}
		if numw == 1 {
			numw = numw+1
			err = stub.PutState(User, []byte(strconv.Itoa(numw)))
			if err != nil {
				return shim.Error(err.Error())
			}
			if err != nil {
				return shim.Error("Expecting integer value for asset holding")
			}
			}else{
				return shim.Error("You already have 2 wallet")
			}
		
	}

	Avalbytes, err := stub.GetState(Userkey)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if Avalbytes != nil{
		fmt.Println("has wallet name")
		return shim.Error("you has wallet name")
	}
	AvalN, err = strconv.Atoi(args[1])
	if err != nil {
		fmt.Println("err2")
		return shim.Error("can't change to int")
	}
	err = stub.PutState(Userkey, []byte(strconv.Itoa(AvalN)))
	if err != nil {
		return shim.Error(err.Error())
	}
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	// fmt.Printf(User + "==================================================\t")
	// fmt.Printf(User,A + "=\t")
	fmt.Printf(User+"\t"+wallet + "=\t")
	fmt.Println(AvalN)
	newmoney := strconv.Itoa(AvalN)
	message := User+"\t"+"Createwallet"+"\t"+wallet+"\t"+newmoney
	// fmt.Printf("Aval2 = %d, Bval = %d\n", Aval2, Bval2)
	//****
	Playload := []byte(message)
	stub.SetEvent("event", Playload)
	// fmt.Printf("Aval2 = %d, Bval = %d\n", Aval2, Bval2)
	//****

	return shim.Success(nil)
}

func (t *FundTransferChaincode) AndAddmoney(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var wallet string
	var User string
	var AvalN int
	var err error

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	//****
	wallet = args[0]
	User = args[2]
	Userkey := wallet+"$$$"+User
	AvalN, err = strconv.Atoi(args[1])
	if err != nil {
		fmt.Println("err1")
		return shim.Error(err.Error())
	}
	Avalbytes, err := stub.GetState(Userkey)
	if err != nil {
		fmt.Println("err2")
		return shim.Error("Failed to get state")
	}
	if Avalbytes == nil{
		fmt.Println("Entity not found")
		return shim.Error("Entity not found")
	}
	Aval, err = strconv.Atoi(string(Avalbytes))
	if err != nil {
		fmt.Println("err3")
		fmt.Println(err)
		return shim.Error("err****************************************************************")
	}
	Aval = Aval + AvalN
	err = stub.PutState(Userkey, []byte(strconv.Itoa(Aval)))
	if err != nil {
		return shim.Error(err.Error())
	}
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	// fmt.Printf(User + "==================================================\t")
	// fmt.Printf(User,A + "=\t")
	fmt.Printf(User+"\t"+wallet + "=\t")
	fmt.Println(Aval)
	newmoney := strconv.Itoa(AvalN)
	allmoney := strconv.Itoa(Aval)
	message := User+"\t"+wallet+"\t"+"addmoney"+"\t"+newmoney+"\tallmoney  "+allmoney
	// fmt.Printf("Aval2 = %d, Bval = %d\n", Aval2, Bval2)
	//****
	Playload := []byte(message)
	stub.SetEvent("event", Playload)
	return shim.Success(nil)
}

//Transaction makes payment of X units from A to B
func (t *FundTransferChaincode) Transfer(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var walletA, walletB string // Entities
	var User1 string
	var User2 string
	// var Aval, Bval int // Asset holdings
	var X int // Transaction value
	var err error
	
	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}
	walletA = args[0]
	walletB = args[2]
	User1 = args[3]
	Userkey1 := walletA+"$$$"+User1
	User2 = args[4]
	Userkey2 := walletB+"$$$"+User2
	fmt.Println(walletA)
	fmt.Println(walletB)
	fmt.Println(User1)
	fmt.Println(User2)
	if Userkey1 == Userkey2 {
		return shim.Error("can't transfer yourself")
	}
	// Get the state from the ledger
	Avalbytes, err := stub.GetState(Userkey1)
	if err != nil {
		return shim.Error("Failed to get state")
	}
	if Avalbytes == nil {
		return shim.Error("Entity not found A")
	}
	Aval, err = strconv.Atoi(string(Avalbytes))
	if err != nil {
		fmt.Println("can't chang to int")
		return shim.Error(err.Error())
	}
	Bvalbytes, err := stub.GetState(Userkey2)
	if err != nil {
		return shim.Error("Failed to get state")
	}
	if Bvalbytes == nil {
		return shim.Error("Entity not found B")
	}
	Bval, _ = strconv.Atoi(string(Bvalbytes))

	X, err = strconv.Atoi(args[1])
	fmt.Println(X)
	if err != nil {
		return shim.Error("Invalid transaction amount, expecting a integer value")
	}
	if X < 1 {
		return shim.Error("Please specify the amount again")
	}
	// Aval2 = Aval2 - X
	// Bval2 = Bval2 + X
	if Aval >= X {
		Aval = Aval - X
		Bval = Bval + X
	} else {
		return shim.Error("You don't have enough money")
	}
	fmt.Printf(User1+"\t"+walletA + "=\t")
	fmt.Println(Aval)
	fmt.Printf(User2+"\t"+walletB + "=\t")
	fmt.Println(Bval)
	// fmt.Printf("Aval2 = %d, Bval2 = %d\n", Aval2, Bval2)

	// Write the state back to the ledger
	err = stub.PutState(Userkey1, []byte(strconv.Itoa(Aval)))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(Userkey2, []byte(strconv.Itoa(Bval)))
	if err != nil {
		return shim.Error(err.Error())
	}

	x := strconv.Itoa(X)
	allmoneyA := strconv.Itoa(Aval)
	allmoneyB := strconv.Itoa(Bval)
	message := User1+"\t"+walletA+"\t"+"Transfer"+"\t"+x+"\tto  "+User2+"\n"+User1+"\thas money  "+allmoneyA+"\t"+User2+"\t"+walletB+"\thas money  "+allmoneyB
	// fmt.Printf("Aval2 = %d, Bval = %d\n", Aval2, Bval2)
	//****
	Playload := []byte(message)
	stub.SetEvent("event", Playload)
		// stub.SetEvent("tranfer", []byte(strconv.Itoa(Bval)))
	return shim.Success(nil)
}

//Check balance
func (t *FundTransferChaincode) CheckBalance(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var wallet string // Entities
    var User string
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting name of the person to query")
	}

	wallet = args[0]
	User = args[1]
	Userkey := wallet+"$$$"+User
	// Get the state from the ledger
	Avalbytes, err := stub.GetState(Userkey)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + wallet + "\"}"
		return shim.Error(jsonResp)
	}

	if Avalbytes == nil {
		jsonResp := "{\"Error\":\"Nil amount for " + wallet + "\"}"
		fmt.Printf("Entity not found")
		return shim.Error(jsonResp)
	}

	jsonResp := "{\"Name\":\"" + wallet + "\",\"Amount\":\"" + string(Avalbytes) + "\"}"
	fmt.Printf("Query Response:%s\n", jsonResp)
	return shim.Success(Avalbytes)
}
// type data struct{
// 	ID_Invoice string
// 	Seller string
// 	Product string
// 	Price string
// 	SentDate string
// 	PO_ID string
// 	Buyer string
// }
// func (t *FundTransferChaincode) CreateInvoice(stub shim.ChaincodeStubInterface, args []string) pb.Response {
// 	var ID_Invoice string
// 	var Seller string
// 	var Product string
// 	var Price string
// 	var SentDate string
// 	var PO_ID string
// 	var Buyer string
	
// 	if len(args) != 7 {
// 		return shim.Error("Incorrect number of arguments. Expecting 2")
// 	}

// 	//****
// 	ID_Invoice = args[0]
// 	Seller = args[1]
// 	Product = args[2]
// 	Price = args[3]
// 	SentDate = args[4]
// 	PO_ID = args[5]
// 	Buyer = args[6]

// 	InformationBuyer, err := stub.GetState(PO_ID)
// 	if err != nil {
// 		fmt.Println(err)
// 		return shim.Error("Failed to get state")
// 	}
// 	if InformationBuyer == nil{
// 			return shim.Error("No this buyer")
// 		}

// 	InformationSeller := &data{

// 	}
// 	err = stub.PutState(Userkey, []byte(strconv.Itoa(AvalN)))
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}
// 	if err != nil {
// 		return shim.Error("Expecting integer value for asset holding")
// 	}
// 	// fmt.Printf(User + "==================================================\t")
// 	// fmt.Printf(User,A + "=\t")
// 	// fmt.Printf(User+"\t"+wallet + "=\t")
// 	// fmt.Println(AvalN)
// 	// newmoney := strconv.Itoa(AvalN)
// 	// message := User+"\t"+"Createwallet"+"\t"+wallet+"\t"+newmoney
// 	// fmt.Printf("Aval2 = %d, Bval = %d\n", Aval2, Bval2)
// 	//****
// 	Playload := []byte(message)
// 	stub.SetEvent("event", Playload)
// 	// fmt.Printf("Aval2 = %d, Bval = %d\n", Aval2, Bval2)
// 	//****

// 	return shim.Success(nil)
// }

func main() {
	err := shim.Start(new(FundTransferChaincode))
	if err != nil {
		fmt.Printf("Error starting FundTransfer chaincode: %s", err)
	}
}
