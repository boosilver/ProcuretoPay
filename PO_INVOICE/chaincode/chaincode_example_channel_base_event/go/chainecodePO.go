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
	USER_ID      string   `json:"USER_ID"`
	USER_HISTORY []string //IN STRING IS PO DATA
	SHOW_HISTORY []string
}
type PO_INFORMATION struct {
	VALUE string `json:"PO_ID"`
	KEY   string `json:"FORM"`
}
type INVOICE_INFORMATION struct {
	KEY   string `json:"KEY"`
	VALUE string `json:"VALUE"`
}
type STORE_KEY struct {
	COMPANYNAME string `json:"COMPANYNAME"`
	PUBLIC_KEY     string `json:"PUBLIC_KEY"`
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
	} else if function == "CheckUser" {
		return t.CheckUser(stub, args)
	} else if function == "StoreKey" {
		return t.StoreKey(stub, args)
	}
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

//#############################################################################
//############################### BUYER #######################################
//#############################################################################
func (t *FundTransferChaincode) CreatePO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var VALUE string
	var KEY string
	var err error
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments ")
	}
	KEY = args[0]
	VALUE = args[1]
	CREATE_PO, err := stub.GetState(KEY) /// ของจริงใช้คีย์เป็น แฮด
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if CREATE_PO != nil {
		return shim.Error("this po number has already been used ")
	}

	PO_DATA := PO_INFORMATION{
		VALUE: VALUE,
		KEY:   KEY,
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
	fmt.Println(" KEY = " + KEY + "\n" + "VALUE = " + VALUE)
	fmt.Println(line)
	Payload := []byte(PO_MARSHAL)
	stub.SetEvent("event", Payload)
	////////////// History
	return shim.Success(PO_MARSHAL)
}

//#############################################################################
//############################### SELLER #######################################
//#############################################################################
func (t *FundTransferChaincode) CreateInvoice(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var VALUE string
	var KEY string
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments  ")
	}
	VALUE = args[0]
	KEY = args[1]                                 ///
	CHEACK_INVOICE_KEY, err := stub.GetState(KEY) /// ของจริงใช้ แฮดแทน
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_INVOICE_KEY != nil {
		return shim.Error("this invoice number has already been used ") //////เช็คว่ามีอินวอยใบนี้หรือยัง ซ้ำไหม
	}
	var INVOICE_INFORMATION = INVOICE_INFORMATION{ ///เก็บค่าลง invoice
		KEY:   KEY,
		VALUE: VALUE,
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
	fmt.Println("VALUE = " + VALUE + "\n" + "KEY = " + KEY)
	fmt.Println(line)
	Payload := []byte(INVOICE_MARSHAL)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(nil)
}
func (t *FundTransferChaincode) CheckUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var ID string
	var USER string
	var err error
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments  ")
	}
	ID = args[0]
	USER = args[1]
	IMFORMATION_USER, err := stub.GetState(ID)
	if err != nil {
		fmt.Println(USER)
		return shim.Error("Failed to get state")
	}
	if IMFORMATION_USER == nil {
		return shim.Error("Don't have history of User ")
	}
	fmt.Println("CC -----------------------------------------------")
	return shim.Success(IMFORMATION_USER)
}

//#############################################################################
//############################### ADMIN #######################################
//#############################################################################

func (t *FundTransferChaincode) StoreKey(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var COMPANYNAME string
	var PUBLIC_KEY string
	var err error
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments 2")
	}
	COMPANYNAME = args[0]
	PUBLIC_KEY = args[1]
	// CREATE_PO, err := stub.GetState(KEY) /// ของจริงใช้คีย์เป็น แฮด
	// if err != nil {
	// 	fmt.Println(err)
	// 	return shim.Error("Failed to get state")
	// }
	// if CREATE_PO != nil {
	// 	return shim.Error("this po number has already been used ")
	// }

	STORE_KEY_DATA := STORE_KEY{
		COMPANYNAME: COMPANYNAME,
		PUBLIC_KEY:     PUBLIC_KEY,
	}
	STORE_KEY_MARSHAL, err := json.Marshal(STORE_KEY_DATA) //make byte arrays
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal create store key")
	}

	err = stub.PutState(COMPANYNAME, STORE_KEY_MARSHAL) /// ของจริงใช้คีย์เป็น แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}

	// fmt.Println(linePO)
	// fmt.Println(" KEY = " + KEY + "\n" + "VALUE = " + VALUE)
	// fmt.Println(line)
	// Payload := []byte(STORE_KEY_MARSHAL)
	// stub.SetEvent("event", Payload)
	////////////// History
	return shim.Success(STORE_KEY_MARSHAL)
}
func main() {
	err := shim.Start(new(FundTransferChaincode))
	if err != nil {
		fmt.Printf("Error starting FundTransfer chaincode: %s", err)
	}
}
