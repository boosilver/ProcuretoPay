package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type FundTransferChaincode struct {
}
type USER_INFORMATION struct {
	USER_ID      string
	USER_HISTORY []string //IN STRING IS PO DATA
}
type PO_INFORMATION struct {
	PO_ID       string
	USER        string
	DATE        string
	PRODUCT     string
	PRICE       string
	SELLER      string
	STATE       string
	ALL_INVOICE []string //PO OF INVOICE
}
type INVOICE_INFORMATION struct {
	INVOICE_ID string
	USER       string
	PRODUCT    string
	PRICE      string
	PO_ID      string
}

var line = ("-------------------------------------------------------------------------------")
var linePO = ("----------------------------   PURCHASE ORDER   -----------------------------")
var lineIvoice = ("----------------------------   INVOICE   ------------------------------------")

func (t *FundTransferChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}
func (t *FundTransferChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	if function == "CheckUser" {
		return t.CheckUser(stub, args)
	} else if function == "InputHistoryUser" {
		return t.InputHistoryUser(stub, args)
	} else if function == "CheckPO" {
		return t.CheckPO(stub, args)
	} else if function == "CheckINVOICE" {
		return t.CheckINVOICE(stub, args)
	} else if function == "CreateINVOICE" {
		return t.CreateINVOICE(stub, args)
	} else if function == "CreatePO" {
		return t.CreatePO(stub, args)
	}
	return shim.Error("Invalid invoke function name. ")
}

func (t *FundTransferChaincode) CheckUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var USER_ID string
	HISTORY_UNMARSHAL := USER_INFORMATION{}
	var err error
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. ")
	}
	USER_ID = args[0]
	IMFORMATION_USER, err := stub.GetState(USER_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if IMFORMATION_USER == nil {
		return shim.Error("Don't have history of User ")
	}
	json.Unmarshal(IMFORMATION_USER, &HISTORY_UNMARSHAL)
	HISTORY := HISTORY_UNMARSHAL.USER_HISTORY
	for i := 1; i <= len(HISTORY); i++ {
		show_data := HISTORY[i]
		fmt.Println(show_data)
	}
	return shim.Success(nil)
}
func (t *FundTransferChaincode) InputHistoryUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//input function to createINVOICE and createPO before function
	var POandINVOICE_ID string
	var USER_ID string
	History := USER_INFORMATION{}
	var err error
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. ")
	}
	POandINVOICE_ID = args[0]
	USER_ID = args[1]

	IMFORMATION_USER, err := stub.GetState(USER_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	json.Unmarshal(IMFORMATION_USER, &History)
	NEW_HISTORY := History.USER_HISTORY
	NEW_HISTORY = append(NEW_HISTORY, POandINVOICE_ID) //OR INVOICE_ID

	var FINAL_HISTORY = USER_INFORMATION{
		USER_ID:      USER_ID,
		USER_HISTORY: NEW_HISTORY,
	}
	HISTORY_MARSHAL, err := json.Marshal(FINAL_HISTORY)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat FINAL_HISTORY")
	}

	err = stub.PutState(USER_ID, HISTORY_MARSHAL)
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}

	return shim.Success(nil)

}

func (t *FundTransferChaincode) CheckPO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var PO_ID string
	PO_INFORMATION := PO_INFORMATION{}
	EACH_INVOICE := INVOICE_INFORMATION{}
	PO_ID = args[0]
	PO_DATA, err := stub.GetState(PO_ID)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for PO_ID " + PO_ID + "\"}"
		return shim.Error(jsonResp)
	}

	if PO_DATA == nil {
		jsonResp := "{\"Error\":\"Nil Value for PO_ID " + PO_ID + "\"}"
		fmt.Printf("Entity not found")
		return shim.Error(jsonResp)
	}
	json.Unmarshal(PO_DATA, &PO_INFORMATION)
	fmt.Println(PO_ID)
	fmt.Println(PO_INFORMATION.USER)
	fmt.Println(PO_INFORMATION.DATE)
	fmt.Println(PO_INFORMATION.PRODUCT)
	fmt.Println(PO_INFORMATION.PRICE)
	fmt.Println(PO_INFORMATION.SELLER)
	fmt.Println("All invoice")
	fmt.Println("--------------------")
	fmt.Println("--------------------")
	DATA_INVOICE := PO_INFORMATION.ALL_INVOICE
	if DATA_INVOICE == nil {
		return shim.Error("THIS PO NOT HAVE INVOICE ")
	} else {
		for i := 1; i <= len(DATA_INVOICE); i++ {
			INVOICE_ID := DATA_INVOICE[i]
			fmt.Println(i)
			fmt.Println(INVOICE_ID)
			fmt.Println("--------------------")
			PO_DATA, err := stub.GetState(INVOICE_ID)
			if err != nil {
				fmt.Println(err)
				return shim.Error("Failed to get state")
			}
			json.Unmarshal(PO_DATA, &EACH_INVOICE)
			USER_INVOICE := EACH_INVOICE.USER
			PRODUCT_INVOICE := EACH_INVOICE.PRODUCT
			fmt.Println(USER_INVOICE)
			fmt.Println(PRODUCT_INVOICE)
		}
	}
	return shim.Success(nil)
}
func (t *FundTransferChaincode) CheckINVOICE(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var INVOICE_ID string
	INVOICE_INFORMATION := INVOICE_INFORMATION{}
	PO_INFORMATION := PO_INFORMATION{}
	INVOICE_ID = args[0]
	INVOICE_DATA, err := stub.GetState(INVOICE_ID)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for INVOICE " + INVOICE_ID + "\"}"
		return shim.Error(jsonResp)
	}

	if INVOICE_DATA == nil {
		jsonResp := "{\"Error\":\"Nil Value for INVOICE_ID " + INVOICE_ID + "\"}"
		fmt.Printf("Entity not found")
		return shim.Error(jsonResp)
	}
	json.Unmarshal(INVOICE_DATA, &INVOICE_INFORMATION)
	fmt.Println("--------------------")
	fmt.Println("DETAIL OF INVOICE")
	fmt.Println("--------------------")
	fmt.Println(INVOICE_INFORMATION.INVOICE_ID)
	fmt.Println(INVOICE_INFORMATION.USER)
	fmt.Println(INVOICE_INFORMATION.PRODUCT)
	fmt.Println(INVOICE_INFORMATION.PRICE)
	PO_ID := INVOICE_INFORMATION.PO_ID
	fmt.Println("--------------------")
	fmt.Println()
	fmt.Println()
	fmt.Println("--------------------")
	fmt.Println("FORM PO  " + PO_ID)
	fmt.Println("--------------------")
	PO_DATA, err := stub.GetState(PO_ID)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for PO " + PO_ID + "\"}"
		return shim.Error(jsonResp)
	}
	if PO_DATA == nil {
		jsonResp := "{\"Error\":\"Nil Value for PO_ID " + PO_ID + "\"}"
		fmt.Printf("Entity not found")
		return shim.Error(jsonResp)
	}
	json.Unmarshal(PO_DATA, &PO_INFORMATION)
	fmt.Println(PO_INFORMATION.USER)
	fmt.Println(PO_INFORMATION.DATE)
	fmt.Println(PO_INFORMATION.PRODUCT)
	fmt.Println(PO_INFORMATION.PRICE)
	fmt.Println(PO_INFORMATION.SELLER)
	fmt.Println("--------------------")
	return shim.Success(nil)
}

func (t *FundTransferChaincode) CreateINVOICE(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var INVOICE_ID string
	var SELLER string
	var PRODUCT string
	var PRICE string
	var PO_ID string
	PO_INFORMATIONS := PO_INFORMATION{}
	INVOICE_ID = args[0]
	SELLER = args[1]
	PRODUCT = args[2]
	PRICE = args[3]
	PO_ID = args[4]
	//InvoiceKey = INVOICE_DATA
	INVOICE_DATA, err := stub.GetState(INVOICE_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if INVOICE_DATA != nil {
		return shim.Error("THIS INVOICE HAS NUMBER ")
	}
	PO_DATA, err := stub.GetState(PO_ID)
	if PO_DATA == nil {
		return shim.Error("PO can't found ")
	}
	json.Unmarshal(PO_DATA, &PO_INFORMATIONS)
	SELLER_PO := PO_INFORMATIONS.SELLER
	if SELLER_PO != SELLER {
		return shim.Error("Error Seller not equal")
	}
	NEW_ALL_INVOICE := PO_INFORMATIONS.ALL_INVOICE
	NEW_ALL_INVOICE = append(NEW_ALL_INVOICE, INVOICE_ID)
	NEW_PO_INFORMATION := PO_INFORMATION{
		PO_ID:       PO_INFORMATIONS.PO_ID,
		USER:        PO_INFORMATIONS.USER,
		DATE:        PO_INFORMATIONS.DATE,
		PRODUCT:     PO_INFORMATIONS.PRODUCT,
		PRICE:       PO_INFORMATIONS.PRICE,
		SELLER:      PO_INFORMATIONS.SELLER,
		ALL_INVOICE: NEW_ALL_INVOICE,
	}
	PO_MARSHAL, err := json.Marshal(NEW_PO_INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal PO")
	}
	err = stub.PutState(PO_ID, PO_MARSHAL)
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	INVOICE_INFORMATION := INVOICE_INFORMATION{
		INVOICE_ID: INVOICE_ID,
		USER:       SELLER,
		PRODUCT:    PRODUCT,
		PRICE:      PRICE,
		PO_ID:      PO_ID,
	}

	INVOICE_MARSHAL, err := json.Marshal(INVOICE_INFORMATION)
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

	return shim.Success(nil)
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
	CHECK_PO, err := stub.GetState(PO_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if CHECK_PO != nil {
		return shim.Error("PO havn't value ")
	}
	PO_DATA := PO_INFORMATION{
		PO_ID:   PO_ID,
		USER:    BUYER,
		DATE:    DATE,
		PRODUCT: PRODUCT,
		PRICE:   PRICE,
		SELLER:  SELLER,
	}
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
	return shim.Success(nil)
}

func main() {
	err := shim.Start(new(FundTransferChaincode))
	if err != nil {
		fmt.Printf("Error starting FundTransfer chaincode: %s", err)
	}
}
