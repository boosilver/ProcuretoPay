package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type FundTransferChaincode struct {
}
type STR_PO struct {
	BUYER   string
	PRODUCT string
	PRICE   string
	DATE    string
	SELLER  string
}
type STR_INVOICE struct {
	INVOICE_ID   string
	PO_ID        string
	SELLER       string
	// BUYER        string
	// PRODUCT      string
	// PRICE        string
	RECEIVED_DAY string
	STR_PO		STR_PO
}
var line       = ("-------------------------------------------------------------------------------")
var linePO     = ("----------------------------   PURCHASE ORDER   -----------------------------")
var lineIvoice = ("----------------------------   INVOICE   ------------------------------------")
func (t *FundTransferChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}
func (t *FundTransferChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	if function == "createPO" {
		return t.CreatePO(stub, args)
	} else if function == "createInvoice" {
		return t.CreateINVOICE(stub, args)
	}
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
	PO_ID = args[0]
	BUYER = args[1]
	PRODUCT = args[2]
	PRICE = args[3]
	DATE = args[4]
	SELLER = args[5]
	returntoeven := linePO+"\nPO_ID = " + PO_ID + "\n" + "BUYER = " + BUYER + "\n" + "PRODUCT = " + PRODUCT + "\n" + "DATE = " + DATE + "\n" + "SELLER = " + SELLER+"\n"+line
	creat_PO, err := stub.GetState(PO_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if creat_PO != nil {
		return shim.Error("PO havn't value ")
	}
	PO_DATA := STR_PO{BUYER, PRODUCT, PRICE, DATE, SELLER}
	PO_MARSHAL, err := json.Marshal(PO_DATA)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat PO")
	}
	if PO_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(PO_ID, PO_MARSHAL)
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(linePO)
	fmt.Println("PO_ID = " + PO_ID + "\n" + "BUYER = " + BUYER + "\n" + "PRODUCT = " + PRODUCT + "\n" + "DATE = " + DATE + "\n" + "SELLER = " + SELLER)
	fmt.Println(line)
	Payload := []byte(returntoeven)
	stub.SetEvent("event", Payload)
	return shim.Success(nil)
}
func (t *FundTransferChaincode) CreateINVOICE(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var INVOICE_ID string
	var SELLER string
	// var PRODUCT string
	// var PRICE string
	var RECEIVED_DAY string
	var PO_ID string
	// var BUYER string
	PO_DATA := STR_PO{}

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. ")
	}
	INVOICE_ID = args[0]
	SELLER = args[1]
	// PRODUCT = args[2]
	// PRICE = args[3]
	RECEIVED_DAY = args[2]
	PO_ID = args[3]
	// BUYER = args[6]
	creat_Invoice, err := stub.GetState(INVOICE_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if creat_Invoice != nil {
		return shim.Error("Invoice exist ")
	}
	check_PO, err := stub.GetState(PO_ID)
	
	if check_PO == nil {
		return shim.Error("PO can't find ")
	}
	json.Unmarshal(check_PO, &PO_DATA)
	SELLER_FORMcreatePO := PO_DATA.SELLER
	if SELLER_FORMcreatePO != SELLER {
		return shim.Error("Error Seller not equal")
	}
	var STR_INVOICE = STR_INVOICE{
		INVOICE_ID: INVOICE_ID,
		PO_ID:	PO_ID,
		SELLER: SELLER,
		RECEIVED_DAY: RECEIVED_DAY,
		STR_PO: PO_DATA,
	}
	// INVOICE_DATA := STR_INVOICE{INVOICE_ID, PO_ID, SELLER, RECEIVED_DAY}
	INVOICE_MARSHAL, err := json.Marshal(STR_INVOICE)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat INVOICE")
	}
	if INVOICE_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(INVOICE_ID, INVOICE_MARSHAL)
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(lineIvoice)
	fmt.Println("INVOICE_ID = " + INVOICE_ID + "\n" + "SELLER = " + SELLER + "\n" + "PRODUCT = "  +PO_DATA.PRODUCT +"PRICE = " +PO_DATA.PRICE + "\n" + "RECEIVED_DAY = " + RECEIVED_DAY + "\n" + "PO_ID =  " + PO_ID + "\n" + "BUYER = "+PO_DATA.BUYER )
	fmt.Println(line)
	returntoeven := lineIvoice+"\nINVOICE_ID = " + INVOICE_ID + "\n" + "SELLER = " + SELLER + "\n" + "PRODUCT = "  +PO_DATA.PRODUCT+ "PRICE = " +PO_DATA.PRICE + "\n" + "RECEIVED_DAY = " + RECEIVED_DAY + "\n" + "PO_ID =  " + PO_ID + "\n" + "BUYER = " +PO_DATA.BUYER+"\n"+line
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
