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
	VALUE string `json:"VALUE"`  ///json คือคีย์ที่ใช้เวลาส่งไปที่อื่นต่อ
	KEY   string `json:"KEY"`
	INVOICE_KEY string `json:"INVOICE_KEY"`
	HASH_USER string `json:"HASH_USER"`
	STATUS string `json:"STATUS"`
}
type INVOICE_INFORMATION struct {
	KEY   string `json:"KEY"`
	VALUE string `json:"VALUE"`
	HASH_USER string `json:"HASH_USER"`
	STATUS string `json:"STATUS"`
}
type INFORMATION struct {
	KEY   string `json:"KEY"`
	VALUE string `json:"VALUE"`
	HASH_USER string `json:"HASH_USER"`
	STATUS string `json:"STATUS"`
}
type KEY_VALUE struct {
	VALUE string `json:"VALUE"`
}
type STORE_KEY struct {
	COMPANYNAME string `json:"COMPANYNAME"`
	PUBLIC_KEY     string `json:"PUBLIC_KEY"`
	STATUS			string `json:"STATUS"`
}

var line = ("-------------------------------------------------------------------------------")
var linePO = ("----------------------------   PURCHASE ORDER   -----------------------------")
var lineIvoice = ("----------------------------   INVOICE   ------------------------------------")
var linepush = ("----------------------------   PUSH IN BLOCKCHAIN   ------------------------------------")

func (t *FundTransferChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}
func (t *FundTransferChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	if function == "CreatePO" {
		return t.CreatePO(stub, args)
	} else if function == "CreateInvoice" {
		return t.CreateInvoice(stub, args)
	} else if function == "GetValue" {
		return t.GetValue(stub, args)
	} else if function == "StoreKey" {
		return t.StoreKey(stub, args)
	} else if function == "PushInBlockchain" {
		return t.PushInBlockchain(stub, args)
	}else if function == "Loan" {
		return t.Loan(stub, args)
	}else if function == "Reject" {
		return t.Reject(stub, args)
	}else if function == "Reject_Invoice" {
		return t.Reject_Invoice(stub, args)
	}else if function == "Push_Block" {
		return t.Push_Block(stub, args)
	}else if function == "Succes_Invoice" {
		return t.Succes_Invoice(stub, args)
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
	var HASH_USER string
	var err error
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments ")
	}
	KEY = args[0]
	VALUE = args[1]
	HASH_USER =args[2]
	CREATE_PO, err := stub.GetState(KEY) /// ของจริงใช้คีย์เป็น แฮด
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if CREATE_PO != nil {
		return shim.Error("this po number has already been used ")
	}

	PO_DATA := PO_INFORMATION{
		KEY:   KEY,
		VALUE: VALUE,
		INVOICE_KEY: "",
		HASH_USER: HASH_USER,
		STATUS: "",
	}
	PO_MARSHAL, err := json.Marshal(PO_DATA)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat PO")
	}
	if PO_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	// fmt.Println("-------fmt.Print(MARSHAL)-----------")
	// fmt.Println(PO_MARSHAL)
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
	var HASH_PO  string
	var INVOICE_KEY string
	var HASH_USER string
	var PO_DATA = PO_INFORMATION{}
	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments  ")
	}
	KEY = args[0]   
	VALUE = args[1] 
	INVOICE_KEY = args[2]  
	HASH_PO =args[3]    
	HASH_USER = args[4]                       ///
	CHEACK_INVOICE_KEY, err := stub.GetState(KEY) /// hash ของ อินวอยนั้นๆ
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state KEY")
	}
	if CHEACK_INVOICE_KEY != nil {
		return shim.Error("this invoice number has already been used ") //////เช็คว่ามีอินวอยใบนี้หรือยัง ซ้ำไหม
	}
	///////////
	PO_MARSHAL, err := stub.GetState(HASH_PO) /// ดึงข้อมูล po มา
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state HASH_PO")
	}
	if PO_MARSHAL == nil {
		return shim.Error("This po does not exist. ") //////เช็คว่ามี PO ใบนี้จริงหรือเปล่า
	}
	json.Unmarshal(PO_MARSHAL, &PO_DATA)  // Unmarshal ให้มองเห็นค่า PO
	if PO_DATA.INVOICE_KEY != ""{
		return shim.Error("This po  has already Invoice "+PO_DATA.INVOICE_KEY+".")
	}
	if PO_DATA.STATUS == "reject"{
		return shim.Error("This PO has been reject.")
	}
	var PO_INFORMATION = PO_INFORMATION{
		VALUE:			PO_DATA.VALUE,
		KEY:   			PO_DATA.KEY,
		INVOICE_KEY:    INVOICE_KEY,  //เอาเลขอินวอยยัดลงไป
		HASH_USER: 		PO_DATA.HASH_USER,
		STATUS:			PO_DATA.STATUS,
	}
	PO_MARSHAL, err = json.Marshal(PO_INFORMATION) //เอาข้อมูล  PO มามาแชล
		if err != nil {
			fmt.Print(err)
			return shim.Error("Can't Marshal PO")
		}
	err = stub.PutState(HASH_PO, PO_MARSHAL) /// เก็บลง po
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub 2 ")
	}
	/////////////////
	var INVOICE_INFORMATION = INVOICE_INFORMATION{ ///เก็บค่าลง invoice
		KEY:   KEY,
		VALUE: VALUE,
		HASH_USER: HASH_USER,
		STATUS: "",
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
	fmt.Println("KEY = " + KEY+"\n" + "VALUE = " + VALUE)
	fmt.Println(line)
	Payload := []byte(INVOICE_MARSHAL)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(INVOICE_MARSHAL)
}

func (t *FundTransferChaincode) Loan(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var KEY string
	var VALUE string
	var Hash_DOC string
	var HASH_USER string
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments  ")
	}
	KEY = args[0]   
	VALUE = args[1]  
	Hash_DOC = args[2] 
	HASH_USER = args[3]  
	var DATA = PO_INFORMATION{}                          ///
	CHEACK_KEY, err := stub.GetState(KEY) 
	fmt.Println(linepush)
	// fmt.Println(CHEACK_KEY)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_KEY != nil {
		return shim.Error("This already been used ") 
	}
	DOC_MARSHAL, err := stub.GetState(Hash_DOC) /// ดึงข้อมูล po มา
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state HASH_PO.")
	}
	if DOC_MARSHAL == nil {
		return shim.Error("This po does not exist. ") //////เช็คว่ามี  ใบนี้จริงหรือเปล่า
	}
	json.Unmarshal(DOC_MARSHAL, &DATA)  // Unmarshal ให้มองเห็นค่า PO
	if DATA.STATUS == "reject"{
		return shim.Error("This document has been reject.")
	}
	var INFORMATION = INFORMATION{ 
		KEY:   KEY,
		VALUE: VALUE,
		HASH_USER: HASH_USER,
		STATUS: "",
	}
	MARSHAL, err := json.Marshal(INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat ")
	}
	if MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(KEY, MARSHAL) /// ของจริงใช้แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(linepush)
	fmt.Println("KEY = " + KEY+"\n" + "VALUE = " + VALUE  )
	fmt.Println(line)
	Payload := []byte(MARSHAL)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(MARSHAL)
}

func (t *FundTransferChaincode) Succes_Invoice(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var KEY string   /// hash ของตัวที่เราจะทำ
	var TYPE string /// สิ่งที่เราจะลบ (เอาไว้เลือกสตัก)
	var HASH_USER string /// hash user ของเราที่จะทำ
	var VALUE string // ข้อมูลที่ส่งไปบอกคู่ค้าว่าเราจะรีเจค
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments  ")
	}
	fmt.Println("Testttttttt1")
	KEY = args[0]   
	TYPE = args[1]  
	HASH_USER = args[2]   
	VALUE = args[3]
	// var PO_DATA = PO_INFORMATION{}      
	var INVOICE_DATA = INVOICE_INFORMATION{} 
	// var KEY_VALUE = KEY_VALUE{} 
	var MARSHAL []byte
	CHEACK_KEY, err := stub.GetState(KEY) 
	fmt.Println(linepush)
	fmt.Println("KEY = "+KEY +"\n" +"TYPE = "+TYPE+"\n" +"HASH_USER = "+HASH_USER)
	// fmt.Println(CHEACK_KEY)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_KEY == nil {
		return shim.Error("Don't have history of User ") 
	}
	fmt.Println("Testttttttt2")
		json.Unmarshal(CHEACK_KEY, &INVOICE_DATA) 
		if INVOICE_DATA.STATUS == "reject"{
			return shim.Error("This Invoice has been reject. ") 
		}
		var INVOICE_INFORMATION = INVOICE_INFORMATION{ 
			KEY:   			INVOICE_DATA.KEY,
			VALUE: 			INVOICE_DATA.VALUE,
			HASH_USER: 		INVOICE_DATA.HASH_USER,
			STATUS: 		"succes",
		}
		fmt.Println("Testttttttt3")
		fmt.Println(HASH_USER)
		fmt.Println(INVOICE_DATA.HASH_USER)
		if HASH_USER == INVOICE_DATA.HASH_USER{
			MARSHAL, err = json.Marshal(INVOICE_INFORMATION)
			if err != nil {
				fmt.Print(err)
				return shim.Error("Can't Marshal creat ")
			}
			if MARSHAL == nil {
				return shim.Error("Marshal havn't value")
			}
		}else{
			return shim.Error("Permission denied Invoice")
		}
		//////////////////
		fmt.Println("Testttttttt4")
	err = stub.PutState(KEY, MARSHAL) /// ของจริงใช้แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub invoice.")
	}
	fmt.Println(linepush)
	fmt.Println("KEY = " + KEY+"\n" + "reject"   )
	fmt.Println(line)

	////////////////
	fmt.Println("VALUE---"+VALUE)
	var KEY_VALUE = KEY_VALUE{ 
		VALUE: 			VALUE,
	}
	fmt.Println("Testttttttt5")
	MARSHAL_VALUSE, err := json.Marshal(KEY_VALUE)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat ")
	}
	if MARSHAL_VALUSE == nil {
		return shim.Error("Marshal havn't value")
	}
	fmt.Println("Test")
	Payload := []byte(MARSHAL_VALUSE)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	//////////////////////////////////////
	// Payload := []byte(MARSHAL)
	// stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(MARSHAL)
}
//#############################################################################
//############################### BANK #######################################
//#############################################################################
func (t *FundTransferChaincode) PushInBlockchain(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var KEY string
	var VALUE string
	var HASH_USER string
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments  ")
	}
	KEY = args[0]   
	VALUE = args[1]  
	HASH_USER = args[2]                            ///
	CHEACK_KEY, err := stub.GetState(KEY) 
	fmt.Println(linepush)
	fmt.Println(CHEACK_KEY)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_KEY != nil {
		return shim.Error("This already been used ") 
	}
	var INFORMATION = INFORMATION{ 
		KEY:   KEY,
		VALUE: VALUE,
		HASH_USER: HASH_USER,
		STATUS: "",
	}
	MARSHAL, err := json.Marshal(INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat ")
	}
	if MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(KEY, MARSHAL) /// ของจริงใช้แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(linepush)
	fmt.Println("KEY = " + KEY+"\n" + "VALUE = " + VALUE  )
	fmt.Println(line)
	Payload := []byte(MARSHAL)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(MARSHAL)
}
func (t *FundTransferChaincode) Push_Block(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var KEY string
	var VALUE string
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments  ")
	}
	KEY = args[0]   
	VALUE = args[1]                         ///
	var INFORMATION = INFORMATION{ 
		KEY:   KEY,
		VALUE: VALUE,
	}
	MARSHAL, err := json.Marshal(INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat ")
	}
	if MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(KEY, MARSHAL) /// ของจริงใช้แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(linepush)
	fmt.Println("KEY = " + KEY+"\n" + "VALUE = " + VALUE  )
	fmt.Println(line)
	Payload := []byte(MARSHAL)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(MARSHAL)
}
func (t *FundTransferChaincode) Reject(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var KEY string   /// hash ของตัวที่เราจะลบ
	var TYPE string /// สิ่งที่เราจะลบ (เอาไว้เลือกสตัก)
	var HASH_USER string /// hash user ของเราที่จะทำ
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments  ")
	}
	KEY = args[0]   
	TYPE = args[1]  
	HASH_USER = args[2]      
	var PO_DATA = PO_INFORMATION{}      
	// var INVOICE_DATA = INVOICE_INFORMATION{} 
	var DATA = INFORMATION{}
	var MARSHAL []byte
	CHEACK_KEY, err := stub.GetState(KEY) 
	fmt.Println(linepush)
	fmt.Println("KEY = "+KEY +"\n" +"TYPE = "+TYPE+"\n" +"HASH_USER = "+HASH_USER)
	// fmt.Println(CHEACK_KEY)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_KEY == nil {
		return shim.Error("Don't have history of User ") 
	}
	if TYPE == "PO"{
		json.Unmarshal(CHEACK_KEY, &PO_DATA) 
		if PO_DATA.INVOICE_KEY == ""{
			if PO_DATA.STATUS == "reject"{
				return shim.Error("This PO loan has been reject. ") 
			}
			var PO_INFORMATION = PO_INFORMATION{
				VALUE:			PO_DATA.VALUE,
				KEY:   			PO_DATA.KEY,
				INVOICE_KEY:    PO_DATA.INVOICE_KEY, 
				HASH_USER: 		PO_DATA.HASH_USER,
				STATUS:			"reject",
			}
			// fmt.Println("new hash user	"+HASH_USER)
			// fmt.Println("old hash user	"+PO_DATA.HASH_USER)
			// fmt.Println("valuse	"+PO_INFORMATION.VALUE)
			// fmt.Println("KEY	"+PO_INFORMATION.KEY)
			// fmt.Println("INVOICE_KEY	"+PO_INFORMATION.INVOICE_KEY)
			// fmt.Println("HASH_USER	"+PO_INFORMATION.HASH_USER)
			// fmt.Println("STATUS	"+PO_INFORMATION.STATUS)
			if HASH_USER == PO_DATA.HASH_USER{
				MARSHAL, err = json.Marshal(PO_INFORMATION)
				if err != nil {
					fmt.Print(err)
					return shim.Error("Can't Marshal creat. ")
				}
				if MARSHAL == nil {
					return shim.Error("Marshal havn't value.")
				}
			}else{
				return shim.Error("Permission denied PO.")
			}	
		}else{
			return shim.Error("Can't reject. This PO has already use by Invoice.")
		}
		
	}else {
		if TYPE == "ENDORSE_LOAN"{
			json.Unmarshal(CHEACK_KEY, &DATA) 
			if DATA.STATUS == "reject"{
				return shim.Error("This Endorse loan has been reject. ") 
			}
			var INFORMATION = INFORMATION{ 
				KEY:   			DATA.KEY,
				VALUE: 			DATA.VALUE,
				HASH_USER: 		DATA.HASH_USER,
				STATUS: 		"reject",
			}
			fmt.Println(HASH_USER)
			fmt.Println(DATA.HASH_USER)
			if HASH_USER == DATA.HASH_USER{
				MARSHAL, err = json.Marshal(INFORMATION)
				if err != nil {
					fmt.Print(err)
					return shim.Error("Can't Marshal creat ")
				}
				if MARSHAL == nil {
					return shim.Error("Marshal havn't value")
				}
			}else{
				return shim.Error("Permission denied ")
			}
		}
	}
	// fmt.Println("-------fmt.Print(MARSHAL)-----------")
	// fmt.Println(MARSHAL)
	err = stub.PutState(KEY, MARSHAL) /// ของจริงใช้แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(linepush)
	fmt.Println("KEY = " + KEY+"\n" + "reject"   )
	fmt.Println(line)
	// Payload := []byte(MARSHAL)
	// stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(MARSHAL)
}
func (t *FundTransferChaincode) Reject_Invoice(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var KEY string   /// hash ของตัวที่เราจะลบ
	var TYPE string /// สิ่งที่เราจะลบ (เอาไว้เลือกสตัก)
	var HASH_USER string /// hash user ของเราที่จะทำ
	var HASH_PO string
	var VALUE string // ข้อมูลที่ส่งไปบอกคู่ค้าว่าเราจะรีเจค
	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments  ")
	}
	KEY = args[0]   
	TYPE = args[1]  
	HASH_USER = args[2]   
	HASH_PO = args[3]   
	VALUE = args[4]
	var PO_DATA = PO_INFORMATION{}      
	var INVOICE_DATA = INVOICE_INFORMATION{} 
	// var KEY_VALUE = KEY_VALUE{} 
	var MARSHAL []byte
	var PO_MARSHAL []byte
	CHEACK_KEY, err := stub.GetState(KEY) 
	fmt.Println(linepush)
	fmt.Println("KEY = "+KEY +"\n" +"TYPE = "+TYPE+"\n" +"HASH_USER = "+HASH_USER)
	// fmt.Println(CHEACK_KEY)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_KEY == nil {
		return shim.Error("Don't have history of User ") 
	}
	if TYPE == "INVOICE"{
		json.Unmarshal(CHEACK_KEY, &INVOICE_DATA) 
		if INVOICE_DATA.STATUS == "reject"{
			return shim.Error("This Invoice has been reject. ") 
		}
		if INVOICE_DATA.STATUS == "succes"{
			return shim.Error("This Invoice has been succes. ") 
		}
		var INVOICE_INFORMATION = INVOICE_INFORMATION{ 
			KEY:   			INVOICE_DATA.KEY,
			VALUE: 			INVOICE_DATA.VALUE,
			HASH_USER: 		INVOICE_DATA.HASH_USER,
			STATUS: 		"reject",
		}
		fmt.Println(HASH_USER)
		fmt.Println(INVOICE_DATA.HASH_USER)
		if HASH_USER == INVOICE_DATA.HASH_USER{
			MARSHAL, err = json.Marshal(INVOICE_INFORMATION)
			if err != nil {
				fmt.Print(err)
				return shim.Error("Can't Marshal creat ")
			}
			if MARSHAL == nil {
				return shim.Error("Marshal havn't value")
			}
		}else{
			return shim.Error("Permission denied Invoice")
		}
		//////////////////
		PO_MARSHAL, err = stub.GetState(HASH_PO) /// ดึงข้อมูล po มา
		if err != nil {
			fmt.Println(err)
			return shim.Error("Failed to get state HASH_PO")
		}
		if PO_MARSHAL == nil {
			return shim.Error("This po does not exist. ") //////เช็คว่ามี PO ใบนี้จริงหรือเปล่า
		}
		json.Unmarshal(PO_MARSHAL, &PO_DATA)
		var PO_INFORMATION = PO_INFORMATION{
			VALUE:			PO_DATA.VALUE,
			KEY:   			PO_DATA.KEY,
			INVOICE_KEY:    "",  
			HASH_USER: 		PO_DATA.HASH_USER,
			STATUS:			PO_DATA.STATUS,
		}
		PO_MARSHAL, err = json.Marshal(PO_INFORMATION) //เอาข้อมูล  PO มามาแชล
			if err != nil {
				fmt.Print(err)
				return shim.Error("Can't Marshal PO.")
			}
			if PO_MARSHAL == nil {
				return shim.Error("PO_MARSHAL havn't value.")
			}
		
	}else {
		return shim.Error("Type  "+TYPE+"  incorrect.")
	}
	// fmt.Println("-------fmt.Print(MARSHAL)-----------")
	// fmt.Println(MARSHAL)
	err = stub.PutState(HASH_PO, PO_MARSHAL) /// เก็บลง po
		if err != nil {
			fmt.Print("err")
			return shim.Error("can't put stub hash po. ")
		}
	err = stub.PutState(KEY, MARSHAL) /// ของจริงใช้แฮด
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub invoice.")
	}
	fmt.Println(linepush)
	fmt.Println("KEY = " + KEY+"\n" + "reject"   )
	fmt.Println(line)

	////////////////
	fmt.Println("VALUE---"+VALUE)
	var KEY_VALUE = KEY_VALUE{ 
		VALUE: 			VALUE,
	}
	MARSHAL_VALUSE, err := json.Marshal(KEY_VALUE)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat ")
	}
	if MARSHAL_VALUSE == nil {
		return shim.Error("Marshal havn't value")
	}
	Payload := []byte(MARSHAL_VALUSE)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	//////////////////////////////////////
	// Payload := []byte(MARSHAL)
	// stub.SetEvent("event", Payload) ///เก็บลอง event
	///////////////////////////// History
	return shim.Success(MARSHAL)
}
//#############################################################################
//############################### GET #######################################
//#############################################################################
func (t *FundTransferChaincode) GetValue(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var ID string
	var USER string
	var err error
	fmt.Println("CC ----------------getvalue-----------------------")
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
	var STATUS string
	var err error
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments 2")
	}
	COMPANYNAME = args[0]
	PUBLIC_KEY = args[1]
	STATUS = args[2]
	// CREATE_PO, err := stub.GetState(KEY) /// ของจริงใช้คีย์เป็น แฮด
	// if err != nil {
	// 	fmt.Println(err)
	// 	return shim.Error("Failed to get state")
	// }
	// if CREATE_PO != nil {
	// 	return shim.Error("this po number has already been used ")
	// }

	STORE_KEY_DATA := STORE_KEY{
		COMPANYNAME: 	COMPANYNAME,
		PUBLIC_KEY:     PUBLIC_KEY,
		STATUS:			STATUS,
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
