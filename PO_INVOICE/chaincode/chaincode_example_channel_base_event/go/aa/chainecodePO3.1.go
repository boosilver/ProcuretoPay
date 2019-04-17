package main

import (
	"encoding/json"
	"fmt"
	// "strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type FundTransferChaincode struct {
}
type USER_INFORMATION struct {
	USER_ID      string   `jason:"USER_ID"`
	USER_HISTORY []string //IN STRING IS PO DATA
	SHOW_HISTORY []string
}
type PO_INFORMATION struct {
	TO		     		string `jason:"PO_ID"`
	FORM       			string `jason:"FORM"`
	TYPE     			string `jason:"TYPE"`
	KEY       			string `jason:"KEY"` //ALL PRICE
	VALUE        		string `jason:"DATE"`
	DATE 				string `jason:"DATE"` //ALL PRODUCT WANT
	SALT				string `jason:"SALT"`
	// ALL_INVOICE 		[]string
}
type INVOICE_INFORMATION struct {
		TO       		string `jason:"TO"`
		FORM            string `jason:"FORM"`
		TYPE            string `jason:"TYPE"`
		KEY          	string `jason:"KEY"`
		VALUE 			string `jason:"VALUE"`
		DATE			string `jason:"DATE"`
}

var line = ("-------------------------------------------------------------------------------")
var linePO = ("----------------------------   PURCHASE ORDER   -----------------------------")
var lineIvoice = ("----------------------------   INVOICE   ------------------------------------")

func (t *FundTransferChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}
func (t *FundTransferChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	if function == "CreatePO" {
		return t.CreatePO(stub, args)
	} else if function == "CreateInvoice" {
		return t.CreateInvoice(stub, args)
	}//else if function == "CheckUser" {
	// 	return t.CheckUser(stub, args)
	// } 
	// } else if function == "CheckPO" {
	// 	return t.CheckPO(stub, args)
	// } else if function == "CheckInvoice" {
	// 	return t.CheckINVOICE(stub, args)
	// } else if function == "Borrow_Invoice_Seller" {
	// 	return t.Borrow_Invoice_Seller(stub, args)
	// } else if function == "Borrow_Invoice_Buyer" {
	// 	return t.Borrow_Invoice_Buyer(stub, args)
	// } else if function == "BorrowPO" {
	// 	return t.BorrowPO(stub, args)
	// }
	return shim.Error("Invalid invoke function name. ")
}

func (t *FundTransferChaincode) CreatePO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var VALUE string
	var KEY string
	// var TO string
	// var FORM string
	// var TYPE string
	// var KEY string
	// var VALUE string
	// var DATE string 
	// var SALT string
	var err error
	if len(args) != 7 {
		return shim.Error("Incorrect number of arguments ")
	}
	TO = args[0]
	FORM = args[1]
	TYPE = args[2]
	KEY = args[3]
	VALUE = args[4]
	DATE = args[5]
	SALT = args[6]
	CREATE_PO, err := stub.GetState(KEY) /// ของจริงใช้คีย์เป็น แฮด
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if CREATE_PO != nil {
		return shim.Error("this po number has already been used ")
	}
	
	PO_DATA := PO_INFORMATION{
		TO:		 	TO,    		
		FORM:     	FORM,  			
		TYPE:     	TYPE,			
		KEY:      	KEY,			
		VALUE:    	VALUE,  		
		DATE: 		DATE,
		SALT:		SALT,		
	}
	PO_MARSHAL, err := json.Marshal(PO_DATA)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat PO")
	}
	if PO_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(KEY, PO_MARSHAL) /// ของจริงใช้คีย์เป็น แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}

	fmt.Println(linePO)
	fmt.Println(" TO = " + TO + "\n" + "FORM = " + FORM + "\n" + "TYPE = " + TYPE + "\n" +"KEY = "+ KEY + "\n" + "VALUE = " + VALUE + "\n" + "DATE = " + DATE + "\n"+"SALT = "+SALT)
	fmt.Println(line)
	Payload := []byte(PO_MARSHAL)
	stub.SetEvent("event", Payload)
	////////////// History
	return shim.Success(PO_MARSHAL)
}

func (t *FundTransferChaincode) CreateInvoice(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var TO string
	var FORM string
	var TYPE string
	var KEY string
	var VALUE string
	var DATE string
	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments  ")
	}
	TO = args[0]
	FORM = args[1]
	TYPE = args[2]
	KEY = args[3] ///
	VALUE = args[4]
	DATE = args[5]
	CHEACK_INVOICE_KEY, err := stub.GetState(KEY) /// ของจริงใช้ แฮดแทน
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_INVOICE_KEY != nil {
		return shim.Error("this invoice number has already been used ") //////เช็คว่ามีอินวอยใบนี้หรือยัง ซ้ำไหม
	}
	// CHECK_PO, err := stub.GetState(PO_ID) ////เช็คว่ามีใบ PO จริงไหม
	// if err != nil {
	// 	fmt.Print(err)
	// 	return shim.Error("Can't GetState2")
	// }
	// if CHECK_PO == nil {
	// 	return shim.Error("PO can't find ")
	// }
	// json.Unmarshal(CHECK_PO, &PO_DATA)
	// SELLER_FORM_CREATEPO := PO_DATA.SELLER
	// if SELLER_FORM_CREATEPO != SELLER {
	// 	return shim.Error("Error Seller not equal") ////เช็คว่าใช่ seller  ที่มีสิทธ์ไหม
	// }
	var INVOICE_INFORMATION = INVOICE_INFORMATION{ ///เก็บค่าลง invoice
		TO:       	 TO,
		FORM:        FORM,
		TYPE:      	 TYPE,
		KEY:         KEY,
		VALUE:       VALUE,
		DATE:		 DATE,
	}
	INVOICE_MARSHAL, err := json.Marshal(INVOICE_INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat INVOICE")
	}
	if INVOICE_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(KEY, INVOICE_MARSHAL) /// ของจริงใช้แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(lineIvoice)
	fmt.Println("TO = " + TO + "\n" + "FORM = " + FORM + "\n" + "TYPE = " + TYPE + "\n" + "KEY = " + KEY + "\n" + "VALUE = " + VALUE +"\n"+"DATE = "+DATE)
	fmt.Println(line)
	Payload := []byte(INVOICE_MARSHAL)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(nil)
}





// func (t *FundTransferChaincode) CheckPO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
// 	var PO_ID string
// 	var BUYER string
// 	PO_MARSHAL := PO_INFORMATION{}
// 	if len(args) != 2 {
// 		return shim.Error("Incorrect number of arguments  Expecting name of the person to query")
// 	}
// 	PO_ID = args[0]
// 	BUYER = args[1]
// 	PO_DATA, err := stub.GetState(PO_ID)
// 	if err != nil {
// 		return shim.Error("can't getstate")
// 	}
// 	if PO_DATA == nil {
// 		return shim.Error("PO  No Information ")
// 	}
// 	json.Unmarshal(PO_DATA, &PO_MARSHAL)
// 	CHECK_BUYER := PO_MARSHAL.BUYER
// 	if BUYER != CHECK_BUYER {
// 		return shim.Error("Error Buyer not equal")
// 	}
// 	return shim.Success(PO_DATA)
// }
// func (t *FundTransferChaincode) CheckINVOICE(stub shim.ChaincodeStubInterface, args []string) pb.Response {
// 	var INVOICE_ID string
// 	var INVOICE_KEY string
// 	var PO_ID string
// 	var SELLER string
// 	INVOICE_MARSHAL := INVOICE_INFORMATION{}
// 	if len(args) != 3 {
// 		return shim.Error("Incorrect number of arguments  Expecting name of the person to query")
// 	}
// 	INVOICE_ID = args[0]
// 	PO_ID = args[1]
// 	SELLER = args[2]
// 	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
// 	INVOICE_DATA, err := stub.GetState(INVOICE_KEY)
// 	if err != nil {
// 		return shim.Error("get invoice error")
// 	}
// 	if INVOICE_DATA == nil {
// 		return shim.Error("Invoice No Information ")
// 	}
// 	json.Unmarshal(INVOICE_DATA, &INVOICE_MARSHAL)
// 	CHECK_SELLER := INVOICE_MARSHAL.SELLER
// 	if SELLER != CHECK_SELLER {
// 		return shim.Error("Error Seller not equal")
// 	}
// 	return shim.Success(INVOICE_DATA)
// }
// func (t *FundTransferChaincode) CheckUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
// 	var User string
// 	var err error
// 	if len(args) != 1 {
// 		return shim.Error("Incorrect number of arguments  ")
// 	}
// 	User = args[0]
// 	IMFORMATION_USER, err := stub.GetState(User)
// 	if err != nil {
// 		fmt.Println(err)
// 		return shim.Error("Failed to get state")
// 	}
// 	if IMFORMATION_USER == nil {
// 		return shim.Error("Don't have history of User ")
// 	}
// 	return shim.Success(IMFORMATION_USER)
// }
// func (t *FundTransferChaincode) Borrow_Invoice_Seller(stub shim.ChaincodeStubInterface, args []string) pb.Response {
// 	var INVOICE_ID string
// 	var SELLER string
// 	var PO_ID string
// 	var INVOICE_KEY string 
// 	var err error
// 	INVOICE_STATUS := INVOICE_INFORMATION{}
// 	if len(args) != 3 {
// 		return shim.Error("Incorrect number of arguments ")
// 	}
// 	INVOICE_ID = args[0]
// 	PO_ID = args[1]
// 	SELLER = args[2]
// 	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
// 	GET_INVOICE, err := stub.GetState(INVOICE_KEY)
// 	if err != nil {
// 		fmt.Println(err)
// 		return shim.Error("Failed to get state")
// 	}
// 	if GET_INVOICE == nil {
// 		return shim.Error("NO INVOICE")
// 	}
// 	json.Unmarshal(GET_INVOICE, &INVOICE_STATUS)
// 	if INVOICE_STATUS.SELLER != SELLER{
// 		return shim.Error("permission denied 1")
// 	}
// 	FIANANCE := INVOICE_STATUS.FINANCE_SELLER
// 	if FIANANCE != "NO"{
// 		return shim.Error("This invoice has already been borrowed ")
// 	}else{
// 		FIANANCE = "already been borrowed"
// 	}
// 	fmt.Println(FIANANCE)

// 	var INVOICE_INFORMATION = INVOICE_INFORMATION{ ///เก็บค่าลง invoice
// 		INVOICE_ID:        INVOICE_ID,
// 		PO_ID:             PO_ID,
// 		RECEIVED_DAY:      INVOICE_STATUS.RECEIVED_DAY,
// 		SELLER:            SELLER,
// 		NUM_SENT:          INVOICE_STATUS.NUM_SENT,
// 		INSTALLMENT_PRICE: INVOICE_STATUS.INSTALLMENT_PRICE,
// 		ALL_PRODUCTS:      INVOICE_STATUS.ALL_PRODUCTS,
// 		ALL_PRICE:         INVOICE_STATUS.ALL_PRICE,
// 		FINANCE_SELLER:	   FIANANCE,
// 		FINANCE_BUYER:	   INVOICE_STATUS.FINANCE_BUYER,
// 		NUM:               INVOICE_STATUS.NUM,
// 		PO_INFORMATION:    INVOICE_STATUS.PO_INFORMATION,
// 	}
// 	INVOICE_MARSHAL, err := json.Marshal(INVOICE_INFORMATION)
// 	if err != nil {
// 		fmt.Print(err)
// 		return shim.Error("Can't Marshal creat PO")
// 	}
// 	if INVOICE_MARSHAL == nil {
// 		return shim.Error("Marshal havn't value")
// 	}
// 	err = stub.PutState(INVOICE_KEY, INVOICE_MARSHAL)
// 	if err != nil {
// 		fmt.Print("err")
// 		return shim.Error("can't put stub ")
// 	}
// 	return shim.Success(INVOICE_MARSHAL)
// }

// func (t *FundTransferChaincode) Borrow_Invoice_Buyer(stub shim.ChaincodeStubInterface, args []string) pb.Response {
// 	var INVOICE_ID string
// 	var BUYER string
// 	var PO_ID string
// 	var INVOICE_KEY string 
// 	var err error
// 	INVOICE_STATUS := INVOICE_INFORMATION{}
// 	CHECK_PO := PO_INFORMATION{}
// 	if len(args) != 3 {
// 		return shim.Error("Incorrect number of arguments ")
// 	}
// 	INVOICE_ID = args[0]
// 	PO_ID = args[1]
// 	BUYER = args[2]
// 	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
// 	BUYER_ID, err := stub.GetState(PO_ID)
// 	json.Unmarshal(BUYER_ID, &CHECK_PO)
// 	if CHECK_PO.BUYER != BUYER{
// 		return shim.Error("permission denied 2")
// 	}
// 	GET_INVOICE, err := stub.GetState(INVOICE_KEY)
// 	if err != nil {
// 		fmt.Println(err)
// 		return shim.Error("Failed to get state")
// 	}
// 	if GET_INVOICE == nil {
// 		return shim.Error("NO INVOICE")
// 	}
// 	json.Unmarshal(GET_INVOICE, &INVOICE_STATUS)
// 	FIANANCE := INVOICE_STATUS.FINANCE_BUYER
// 	if FIANANCE != "NO"{
// 		return shim.Error("This invoice has already been borrowed ")
// 	}else{
// 		FIANANCE = "already been borrowed"
// 	}
// 	fmt.Println(FIANANCE)

// 	var INVOICE_INFORMATION = INVOICE_INFORMATION{ ///เก็บค่าลง invoice
// 		INVOICE_ID:        INVOICE_ID,
// 		PO_ID:             PO_ID,
// 		RECEIVED_DAY:      INVOICE_STATUS.RECEIVED_DAY,
// 		SELLER:            INVOICE_STATUS.SELLER,
// 		NUM_SENT:          INVOICE_STATUS.NUM_SENT,
// 		INSTALLMENT_PRICE: INVOICE_STATUS.INSTALLMENT_PRICE,
// 		ALL_PRODUCTS:      INVOICE_STATUS.ALL_PRODUCTS,
// 		ALL_PRICE:         INVOICE_STATUS.ALL_PRICE,
// 		FINANCE_SELLER:	   INVOICE_STATUS.FINANCE_SELLER,
// 		FINANCE_BUYER:	   FIANANCE,
// 		NUM:               INVOICE_STATUS.NUM,
// 		PO_INFORMATION:    INVOICE_STATUS.PO_INFORMATION,
// 	}
// 	INVOICE_MARSHAL, err := json.Marshal(INVOICE_INFORMATION)
// 	if err != nil {
// 		fmt.Print(err)
// 		return shim.Error("Can't Marshal creat PO")
// 	}
// 	if INVOICE_MARSHAL == nil {
// 		return shim.Error("Marshal havn't value")
// 	}
// 	err = stub.PutState(INVOICE_KEY, INVOICE_MARSHAL)
// 	if err != nil {
// 		fmt.Print("err")
// 		return shim.Error("can't put stub ")
// 	}
// 	return shim.Success(INVOICE_MARSHAL)
// }
// func (t *FundTransferChaincode) BorrowPO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
// 	var PO_ID string
// 	var SELLER string
// 	PO_UNMARSHAL := PO_INFORMATION{}
// 	if len(args) != 2 {
// 		return shim.Error("Incorrect number of arguments  Expecting name of the person to query")
// 	}
// 	PO_ID = args[0]
// 	SELLER = args[1]
// 	PO_DATA, err := stub.GetState(PO_ID)
// 	if err != nil {
// 		return shim.Error("can't getstate")
// 	}
// 	if PO_DATA == nil {
// 		return shim.Error("PO  No Information ")
// 	}
// 	json.Unmarshal(PO_DATA, &PO_UNMARSHAL)
// 	CHECK_FINANCIAL := PO_UNMARSHAL.FINANCIAL_STATUS
// 	fmt.Println(CHECK_FINANCIAL)
// 	if CHECK_FINANCIAL != "NO" {
// 		return shim.Error("this PO  has been borrowed")
// 	}
// 	if SELLER != PO_UNMARSHAL.SELLER {
// 		return shim.Error("this user not equal")
// 	}
// 	BORROW := "Borrowed"
// 	PO_UNMARSHAL.FINANCIAL_STATUS = BORROW
// 	PO_MARSHAL, err := json.Marshal(PO_UNMARSHAL)
// 	if err != nil {
// 		fmt.Print(err)
// 		return shim.Error("Can't Marshal PO")
// 	}
// 	err = stub.PutState(PO_ID, PO_MARSHAL) ///เอาค่าที่เพิ่มใส่ลง
// 	if err != nil {
// 		fmt.Print(err)
// 		return shim.Error("can't put stub ")
// 	}
// 	return shim.Success(nil)
// }
func main() {
	err := shim.Start(new(FundTransferChaincode))
	if err != nil {
		fmt.Printf("Error starting FundTransfer chaincode: %s", err)
	}
}
