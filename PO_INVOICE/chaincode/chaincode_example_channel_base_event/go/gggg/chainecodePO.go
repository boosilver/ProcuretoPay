package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type FundTransferChaincode struct {
}

type DATA struct {
	BUYER   string
	PRODUCT string
	PRICE   string
	DATE    string
	SELLER  string
}

//Init function
func (t *FundTransferChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

//All mapping function in chaincode
func (t *FundTransferChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	// fmt.Println("Fund_Transfer_Chaincode Invoke")
	function, args := stub.GetFunctionAndParameters()
	if function == "createPO" {
		return t.CreatePO(stub, args)
	}
	// } else if function == "transfer" {
	// 	return t.Transfer(stub, args)
	// } else if function == "check" {
	// 	return t.CheckBalance(stub, args)
	// } else if function == "creatPO" {
	// 	return t.CreatPO(stub, args)
	// }

	return shim.Error("Invalid invoke function name. ")
}

func (t *FundTransferChaincode) CreatePO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var PO_ID string
	var BUYER string
	var PRODUCT string
	var PRICE string
	var DATE string
	var SELLER string
	var err error
	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. ")
	}

	//****
	PO_ID = args[0]
	BUYER = args[1]
	PRODUCT = args[2]
	PRICE = args[3]
	DATE = args[4]
	SELLER = args[5]
	line := ("-------------------------------------------------------------------------------")
	returntoeven := line+"\nPO_ID = " + PO_ID + "\n" + "BUYER = " + BUYER + "\n" + "PRODUCT = " + PRODUCT + "\n" + "DATE = " + DATE + "\n" + "SELLER = " + SELLER+"\n"+line
	creat_PO, err := stub.GetState(PO_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if creat_PO != nil {
		return shim.Error("PO havn't value ")
	}
	PO_DATA := DATA{BUYER, PRODUCT, PRICE, DATE, SELLER}
	PO_MARSHAL, err := json.Marshal(PO_DATA)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal on creat PO")
	}
	if PO_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(PO_ID, PO_MARSHAL)
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}

	// fmt.Printf(User + "==================================================\t")
	// fmt.Printf(User,A + "=\t")
	// fmt.Printf(User + "\t" + wallet + "=\t")
	fmt.Println(line)
	fmt.Println("PO_ID = " + PO_ID + "\n" + "BUYER = " + BUYER + "\n" + "PRODUCT = " + PRODUCT + "\n" + "DATE = " + DATE + "\n" + "SELLER = " + SELLER)
	fmt.Println(line)

	// fmt.Printf("Aval2 = %d, Bval = %d\n", Aval2, Bval2)
	//****

	Payload := []byte(returntoeven)
	stub.SetEvent("event", Payload)

	return shim.Success(nil)
}

func main() {
	err := shim.Start(new(FundTransferChaincode))
	if err != nil {
		fmt.Printf("Error starting FundTransfer chaincode: %s", err)
	}
}
