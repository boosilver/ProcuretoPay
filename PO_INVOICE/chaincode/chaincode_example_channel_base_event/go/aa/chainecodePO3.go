package main

import (
	"encoding/json"
	"fmt"
	"strconv"

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
	PO_ID       		string `jason:"PO_ID"`
	BUYER       		string `jason:"BUYER"`
	PRODUCT     		string `jason:"PRODUCT"`
	PRICE       		string `jason:"PRICE"` //ALL PRICE
	DATE        		string `jason:"DATE"`
	SELLER      		string `jason:"SELLER"`
	NUM_PRODUCT 		string `jason:"NUM_PRODUCT"` //ALL PRODUCT WANT
	LOT         		string `jason:"LOT"`         //จำนวนล็อตที่ส่ง
	STATUS      		string `jason:"STATUS"`
	FINANCIAL_STATUS 	string `jason:"FINANCIAL_STATUS"` //status ในการกูยืมเงิน ว่ามีสิทธิ์ไหม
	ALL_INVOICE 		[]string
}
type INVOICE_INFORMATION struct {
	INVOICE_ID        string `jason:"INVOICE_ID"`
	PO_ID             string `jason:"PO_ID"`
	SELLER            string `jason:"SELLER"`
	NUM_SENT          string `jason:"NUM_SENT"`
	INSTALLMENT_PRICE string `jason:"INSTALLMENT_PRICE"`
	RECEIVED_DAY      string `jason:"RECEIVED_DAY"`
	// PRODUCT           string `jason:"PRODUCT"`
	// PRICE             string `jason:"PRICE"`
	ALL_PRODUCTS      string `jason:"ALL_PRODUCTS"`
	ALL_PRICE         string `jason:"ALL_PRICE"`
	NUM               string `jason:"NUM"`
	FINANCE_SELLER	  string `jason:"FINANCE_SELLER"`
	FINANCE_BUYER	  string `jason:"FINANCE_BUYER"`
	PO_INFORMATION    PO_INFORMATION
	// BUYER        string
	// PRODUCT      string
	// PRICE        string
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
	} else if function == "CheckUser" {
		return t.CheckUser(stub, args)
	} else if function == "CreateInvoice" {
		return t.CreateInvoice(stub, args)
	} else if function == "CheckPO" {
		return t.CheckPO(stub, args)
	} else if function == "CheckInvoice" {
		return t.CheckINVOICE(stub, args)
	} else if function == "Borrow_Invoice_Seller" {
		return t.Borrow_Invoice_Seller(stub, args)
	} else if function == "Borrow_Invoice_Buyer" {
		return t.Borrow_Invoice_Buyer(stub, args)
	} else if function == "BorrowPO" {
		return t.BorrowPO(stub, args)
	}
	return shim.Error("Invalid invoke function name. ")
}

func (t *FundTransferChaincode) CreatePO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var PO_ID string
	var BUYER string
	var PRODUCT string
	var PRICE string
	var SELLER string
	var DATE string
	var NUM_PRODUCT string
	var STATUS string
	var LOT string
	var ALL_INVOICE []string
	var err error
	if len(args) != 8 {
		return shim.Error("Incorrect number of arguments ")
	}
	STATUS = "Waiting for response"
	HISTORY := USER_INFORMATION{}
	PO_ID = args[0]
	BUYER = args[1]
	DATE = args[2]
	PRODUCT = args[3]
	NUM_PRODUCT = args[4]
	PRICE = args[5]
	SELLER = args[6]
	LOT = args[7]
	returntoeven := linePO + "\nPO_ID = " + PO_ID + "\n" + "BUYER = " + BUYER + "\n" + "PRODUCT = " + PRODUCT + "\n" + "NUM_PRODUCT = " + NUM_PRODUCT + "\n" + "PRICE = " + PRICE + "\n" + "DATE = " + DATE + "\n" + "SELLER = " + SELLER + "\n" + "LOT = " + LOT + "\n" + "STATUS = " + STATUS + "\n" + line
	CREATE_PO, err := stub.GetState(PO_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if CREATE_PO != nil {
		return shim.Error("this po number has already been used ")
	}
	NON := "NO"
	PO_DATA := PO_INFORMATION{
		PO_ID:          	PO_ID,
		BUYER:           	BUYER,
		PRODUCT:          	PRODUCT,
		PRICE:            	PRICE,
		DATE:             	DATE,
		SELLER:           	SELLER,
		NUM_PRODUCT:      	NUM_PRODUCT,	
		LOT:              	LOT,
		STATUS:          	STATUS,
		FINANCIAL_STATUS: 	NON,
		ALL_INVOICE:      	ALL_INVOICE,
	}
	SS := PO_DATA.FINANCIAL_STATUS
	fmt.Println(SS+"	*****************************")
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
	fmt.Println("PO_ID = " + PO_ID + "\n" + "BUYER = " + BUYER + "\n" + "PRODUCT = " + PRODUCT + "\n" +"NUM_PRODUCT = "+ NUM_PRODUCT + "\n" + "PRICE = " + PRICE + "\n" + "DATE = " + DATE + "\n" + "SELLER = " + SELLER + "\n" + "LOT = " + LOT + "\n" + "STATUS = " + STATUS + "\n")
	fmt.Println(line)
	Payload := []byte(returntoeven)
	stub.SetEvent("event", Payload)
	//////////////
	IMFORMATION_USER, err := stub.GetState(BUYER)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	json.Unmarshal(IMFORMATION_USER, &HISTORY)
	NEW_HISTORY := HISTORY.USER_HISTORY
	NEWSHOW_HISTORY := HISTORY.SHOW_HISTORY
	PO_ID_SHOW := "PO-" + PO_ID
	NEWSHOW_HISTORY = append(NEWSHOW_HISTORY, PO_ID_SHOW)
	NEW_HISTORY = append(NEW_HISTORY, PO_ID) //OR INVOICE_ID
	USER_ID := BUYER
	var FINAL_HISTORY = USER_INFORMATION{
		USER_ID:      USER_ID,
		USER_HISTORY: NEW_HISTORY,
		SHOW_HISTORY: NEWSHOW_HISTORY,
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
	// fmt.Println(PO_MARSHAL)
	return shim.Success(PO_MARSHAL)
}

var NUM_INVOICE string

func (t *FundTransferChaincode) CreateInvoice(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var INVOICE_ID string
	var INVOICE_OLD string
	var RECEIVED_DAY string
	var SELLER string
	var NUM_SENT string
	var INSTALLMENT_PRICE string
	var ALL_PRODUCTS string
	var ALL_PRICE string
	var INVOICE_KEY string
	var PO_ID string
	PO_DATA := PO_INFORMATION{}
	EACH_INVOICE := INVOICE_INFORMATION{}
	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments  ")
	}
	HISTORY := USER_INFORMATION{}
	INVOICE_ID = args[0]
	PO_ID = args[1]
	RECEIVED_DAY = args[2]
	NUM_SENT = args[3] ///
	INSTALLMENT_PRICE = args[4]
	SELLER = args[5]
	ALL_PRODUCTS = NUM_SENT
	ALL_PRICE = INSTALLMENT_PRICE
	INVOICES_LEAVES := SELLER + "$$$" + PO_ID       ///เช็คว่ามีใบหรือยัง ใบที่เท่าไร
	CHECK_NUM_INVOICE := INVOICE_ID + "$$$" + PO_ID ///เช็คว่ามีใบนี้ซ้ำไหม
	CHEACK_INVOICE_KEY, err := stub.GetState(CHECK_NUM_INVOICE)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_INVOICE_KEY != nil {
		return shim.Error("this invoice number has already been used ") //////เช็คว่ามีอินวอยใบนี้หรือยัง ซ้ำไหม
	}
	CHECK_PO, err := stub.GetState(PO_ID) ////เช็คว่ามีใบ PO จริงไหม
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't GetState2")
	}
	if CHECK_PO == nil {
		return shim.Error("PO can't find ")
	}
	json.Unmarshal(CHECK_PO, &PO_DATA)
	SELLER_FORM_CREATEPO := PO_DATA.SELLER
	if SELLER_FORM_CREATEPO != SELLER {
		return shim.Error("Error Seller not equal") ////เช็คว่าใช่ seller  ที่มีสิทธ์ไหม
	}
	if PO_DATA.STATUS == "Success" {
		return shim.Error("The invoice is complete")
	}
	CREATE_INVOICE, err := stub.GetState(INVOICES_LEAVES) ///ดึงมาว่าปัจจุบันเป็นใบที่เท่าไร
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state2")
	}
	i := 1
	if CREATE_INVOICE == nil {
		err = stub.PutState(INVOICES_LEAVES, []byte(strconv.Itoa(1))) /////เช็คว่ามีใบนี้หรือยัง  ถ้ายังจะกำหนดเป็นใบที่ 1
		if err != nil {
			return shim.Error("Expecting integer value for asset holding")
		}
	} else {
		NUM, err := strconv.Atoi(string(CREATE_INVOICE)) ///ถ้ามีค่าแล้ว จำนวนใบจะดึงค่าจำนวนใบมา
		if err != nil {
			return shim.Error("can't chang to int")
		}
		for ; NUM != i; i++ {
		}
	}
	err = stub.PutState(INVOICES_LEAVES, []byte(strconv.Itoa(i+1))) /// เก็บค่าใบ +1 (+ล่วงหน้าของใบถัดไปเพื่อดึงมาใช้ในครั้งหน้า)
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	NUM_INVOICE, err := stub.GetState(INVOICES_LEAVES) ///ดึงค่าใบปัจุบัน (รอบก่อนเขียนมาเผื่อให้แล้ว)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't GetState1")
	}
	var NUM_I int
	if NUM_INVOICE != nil {
		NUM_I, err = strconv.Atoi(string(NUM_INVOICE)) /// ถ้าไม่ใช่นิลคือมีใบแล้ว นำมาแปลงเป็น int
		if err != nil {
			fmt.Print(err)
			return shim.Error("Can't change string to int 1")
		}
	}
	if CREATE_INVOICE == nil { /// แต่ถ้าไม่เคยมีใบมาก่อนให้ถือว่าเป็นใบที่ 1
		NUM_I = NUM_I + 1
	}
	/// ถ้าครั้งแรก ค่าจำนวนใบจะเป็น 0 ครั้งที่ 2 จะเป็น 1  จึง + 1
	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't GetState3")
	}
	CHECK_PO, err = stub.GetState(PO_ID) ///ดึงค่าจากใบ po
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't GetState4")
	}
	if CHECK_PO == nil {
		return shim.Error("PO can't find ")
	}
	json.Unmarshal(CHECK_PO, &PO_DATA)
	INVOICE_KEY2 := PO_DATA.ALL_INVOICE ///เช็คประวัติใบ invoice ในใบ  po
	for i := 0; i < len(INVOICE_KEY2); i++ {
		INVOICE_OLD = INVOICE_KEY2[i] + "$$$" + PO_ID /// หารหัสใบ invoice ใบล่าสุดจากประวัติในใบ  po
	}

	INVOICE_NUM, err := stub.GetState(INVOICE_OLD) ///ดึงค่าจากใบ invoice ใบล่าสุด(ก่อนหน้าใบที่กำลังทำ)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state3")
	}
	json.Unmarshal(INVOICE_NUM, &EACH_INVOICE)
	CHECK_ALL_PRODUCT := EACH_INVOICE.ALL_PRODUCTS           ///เอาค่าสินค้าที่ส่งไปแล้วทั้งหมดมา
	CHECK_ALL_PRICE := EACH_INVOICE.ALL_PRICE                /// เอาราคาที่ส่งบินเก็บไปแล้วทั้งหมดมา
	OLD_ALL_PRODUCTS, err := strconv.Atoi(CHECK_ALL_PRODUCT) ///ประวัติจำนวนสินค้าทั้งหมด(จากใบก่อนหน้า)แปลงเป็น int
	if err != nil && NUM_I != 1 {
		fmt.Print(err)
		return shim.Error("Can't change string to int2")
	}
	NEW_ALL_PRODUCTS, err := strconv.Atoi(ALL_PRODUCTS) ///สินค้าที่เพิ่มเข้ามาในรอบนี้
	if err != nil && NUM_I != 1 {
		fmt.Print(err)
		return shim.Error("Can't change string to int3")
	}
	SUM_ALL_PRODUCTS := NEW_ALL_PRODUCTS + OLD_ALL_PRODUCTS     ///สินค้ารวมล่าสุด+สินค้าที่เพิ่มเข้ามา
	ALL_PRODUCTS = strconv.Itoa(SUM_ALL_PRODUCTS)               ///จำนวนสินค้าทั้งหมดแปลงเป็น string
	OLD_ALL_PRICE, err := strconv.Atoi(string(CHECK_ALL_PRICE)) ///ประวัติราคาทั้งหมด(จากใบก่อนหน้า)แปลงเป็น int
	if err != nil && NUM_I != 1 {
		fmt.Print(err)
		return shim.Error("Can't change string to int4")
	}
	NEW_ALL_PRICE, err := strconv.Atoi(string(ALL_PRICE)) /// ราคาที่เพิ่มเข้ามาในรอบนี้
	if err != nil && NUM_I != 1 {
		fmt.Print(err)
		return shim.Error("Can't change string to int5")
	}
	SUM_ALL_PRICE := NEW_ALL_PRICE + OLD_ALL_PRICE ///ราคารวมล่าสุด+ราคาที่เพิ่มมา
	ALL_PRICE = strconv.Itoa(SUM_ALL_PRICE)        ///แปลงเป็น string

	NUM := strconv.Itoa(NUM_I)                 /// ใบที่กำลังทำอยู่ ใบที่เท่าไร
	LOT_FULL, err := strconv.Atoi(PO_DATA.LOT) ///ดึงค่าจำนวนลอท
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't change string to int7")
	}
	if NUM_I > LOT_FULL { ///ถ้าจำนวนรอบมากกว่าที่กำหนดคือสำเร็จแล้ว
		return shim.Error("The invoice is complete")
	}
	NUM_FULL_PRODUCT, err := strconv.Atoi(PO_DATA.NUM_PRODUCT) ///จำนวนสินค้าทั้งหมดที่สั่ง
	if err != nil {
		return shim.Error("Can't change string to int9")
	}
	PRICE_FULL, err := strconv.Atoi(PO_DATA.PRICE) ///ราคาทั้งหมดที่สั่ง
	if err != nil {
		return shim.Error("Can't change string to int11")
	}
	if SUM_ALL_PRODUCTS > NUM_FULL_PRODUCT { ////ถ้าสินค้าปัจุบันมากกว่าที่ลูกค้าสั่ง
		return shim.Error("to many product")
	}
	if SUM_ALL_PRICE > PRICE_FULL { ////ถ้าราคาปัจจุบันเกินที่ลูกค้าสั่ง
		return shim.Error("to many price")
	}
	if SUM_ALL_PRODUCTS == NUM_FULL_PRODUCT && SUM_ALL_PRICE == PRICE_FULL {
		PO_DATA.STATUS = "Success"
	} else {
		PO_DATA.STATUS = "Pending"
	}
	NEW_ALL_INVOICE := PO_DATA.ALL_INVOICE
	NEW_ALL_INVOICE = append(NEW_ALL_INVOICE, INVOICE_ID) ///เพิ่มเลขใบอินวอยในใบพีโอ
	NEW_PO_INFORMATION := PO_INFORMATION{
		PO_ID:       			PO_DATA.PO_ID,
		BUYER:       			PO_DATA.BUYER,
		DATE:        			PO_DATA.DATE,
		PRODUCT:     			PO_DATA.PRODUCT,
		PRICE:      			PO_DATA.PRICE,
		SELLER:      			PO_DATA.SELLER,
		NUM_PRODUCT: 			PO_DATA.NUM_PRODUCT,
		LOT:         			PO_DATA.LOT,
		STATUS:      			PO_DATA.STATUS,
		FINANCIAL_STATUS: 		PO_DATA.FINANCIAL_STATUS,
		ALL_INVOICE: 			NEW_ALL_INVOICE,
	}
	PO_MARSHAL, err := json.Marshal(NEW_PO_INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal PO")
	}
	err = stub.PutState(PO_ID, PO_MARSHAL) ///เอาค่าที่เพิ่มใส่ลง
	if err != nil {
		fmt.Print(err)
		return shim.Error("can't put stub ")
	}
	if NUM == PO_DATA.LOT {
		if ALL_PRODUCTS != PO_DATA.NUM_PRODUCT {
			RESULT := NUM_FULL_PRODUCT - SUM_ALL_PRODUCTS
			RESULT_PRODUCT := strconv.Itoa(RESULT)
			return shim.Error("Product must full , Absent  = " + RESULT_PRODUCT) ///ขาดสินค้าเท่าไร
		} else if ALL_PRICE != PO_DATA.PRICE {
			RESULT := PRICE_FULL - SUM_ALL_PRICE
			RESULT_PRODUCT := strconv.Itoa(RESULT)
			return shim.Error("Price must full, Absent  = " + RESULT_PRODUCT) ///ขาดเงินเท่าไร
		}
		PO_DATA.STATUS = "Success"
		NEW_PO_INFORMATION := PO_INFORMATION{ ////เมื่อ รอบที่ทำเท่ากับลอท แล้วผ่านเงื่อนไข เปลี่ยนสถาณะเป็น SUCCCES
			PO_ID:       			PO_DATA.PO_ID,
			BUYER:       			PO_DATA.BUYER,
			DATE:        			PO_DATA.DATE,
			PRODUCT:     			PO_DATA.PRODUCT,
			PRICE:       			PO_DATA.PRICE,
			SELLER:      			PO_DATA.SELLER,
			NUM_PRODUCT: 			PO_DATA.NUM_PRODUCT,
			LOT:         			PO_DATA.LOT,
			STATUS:      			PO_DATA.STATUS,
			FINANCIAL_STATUS: 		PO_DATA.FINANCIAL_STATUS,
			ALL_INVOICE: 			NEW_ALL_INVOICE,
		}
		PO_MARSHAL, err := json.Marshal(NEW_PO_INFORMATION)
		if err != nil {
			fmt.Print(err)
			return shim.Error("Can't Marshal PO")
		}
		err = stub.PutState(PO_ID, PO_MARSHAL) ///เอาค่าที่เพิ่มใส่ลง
		if err != nil {
			fmt.Print("err")
			return shim.Error("can't put stub ")
		}
	}
	FIANANCE := "NO"
	FINANCE_BUYER := "NO"
	var INVOICE_INFORMATION = INVOICE_INFORMATION{ ///เก็บค่าลง invoice
		INVOICE_ID:        INVOICE_ID,
		PO_ID:             PO_ID,
		RECEIVED_DAY:      RECEIVED_DAY,
		SELLER:            SELLER,
		NUM_SENT:          NUM_SENT,
		INSTALLMENT_PRICE: INSTALLMENT_PRICE,
		ALL_PRODUCTS:      ALL_PRODUCTS,
		ALL_PRICE:         ALL_PRICE,
		FINANCE_SELLER:	   FIANANCE,
		FINANCE_BUYER:	   FINANCE_BUYER,
		NUM:               NUM,
		PO_INFORMATION:    PO_DATA,
	}

	// INVOICE_DATA := INVOICE_INFORMATION{INVOICE_ID, PO_ID, SELLER, RECEIVED_DAY}
	INVOICE_MARSHAL, err := json.Marshal(INVOICE_INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat INVOICE")
	}
	if INVOICE_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}

	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID /// คีย์ของรอบนี้
	// +"$$$"+NUM
	err = stub.PutState(INVOICE_KEY, INVOICE_MARSHAL) ///เก็บข้อมูลลงในคีย์
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(lineIvoice)
	fmt.Println("INVOICE_ID = " + INVOICE_ID + "\n" + "SELLER = " + SELLER + "\n" + "PRODUCT = " + PO_DATA.PRODUCT + "\n" + "PRICE = " + PO_DATA.PRICE + "\n" + "RECEIVED_DAY = " + RECEIVED_DAY + "\n" + "PO_ID =  " + PO_ID + "\n" + "BUYER = " + PO_DATA.BUYER + "\n" + "NUM_SENT = " + NUM_SENT + "\n" + "INSTALLMENT_PRICE = " + INSTALLMENT_PRICE + "\n" + "ALL_PRODUCTS = " + ALL_PRODUCTS + "\n" + "ALL_PRICE = " + ALL_PRICE + "\n" + "NUM_INVOICE = " + NUM)
	fmt.Println(line)
	returntoeven := lineIvoice + "\nINVOICE_ID = " + INVOICE_ID + "\n" + "SELLER = " + SELLER + "\n" + "PRODUCT = " + PO_DATA.PRODUCT + "\n" + "PRICE = " + PO_DATA.PRICE + "\n" + "RECEIVED_DAY = " + RECEIVED_DAY + "\n" + "PO_ID =  " + PO_ID + "\n" + "BUYER = " + PO_DATA.BUYER + "\n" + "NUM_SENT = " + NUM_SENT + "\n" + "INSTALLMENT_PRICE = " + INSTALLMENT_PRICE + "\n" + "ALL_PRODUCTS = " + ALL_PRODUCTS + "\n" + "ALL_PRICE = " + ALL_PRICE + "\n" + "NUM_INVOICE = " + NUM + "\n" + line
	Payload := []byte(returntoeven)
	stub.SetEvent("event", Payload) ///เก็บลอง event
	/////////////////////////////
	IMFORMATION_USER, err := stub.GetState(SELLER)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	json.Unmarshal(IMFORMATION_USER, &HISTORY)
	NEW_HISTORY := HISTORY.USER_HISTORY 				///เก็บข้อมูลเลขใบลง history
	NEWSHOW_HISTORY := HISTORY.SHOW_HISTORY
	INVOICE_ID_SHOW := "INVOICRE-" + INVOICE_ID
	NEWSHOW_HISTORY = append(NEWSHOW_HISTORY, INVOICE_ID_SHOW)
	NEW_HISTORY = append(NEW_HISTORY, INVOICE_ID) //OR INVOICE_ID
	USER_ID := SELLER
	var FINAL_HISTORY = USER_INFORMATION{
		USER_ID:      USER_ID,
		USER_HISTORY: NEW_HISTORY,
		SHOW_HISTORY: NEWSHOW_HISTORY,
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
	var BUYER string
	PO_MARSHAL := PO_INFORMATION{}
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments  Expecting name of the person to query")
	}
	PO_ID = args[0]
	BUYER = args[1]
	PO_DATA, err := stub.GetState(PO_ID)
	if err != nil {
		return shim.Error("can't getstate")
	}
	if PO_DATA == nil {
		return shim.Error("PO  No Information ")
	}
	json.Unmarshal(PO_DATA, &PO_MARSHAL)
	CHECK_BUYER := PO_MARSHAL.BUYER
	if BUYER != CHECK_BUYER {
		return shim.Error("Error Buyer not equal")
	}
	return shim.Success(PO_DATA)
}
func (t *FundTransferChaincode) CheckINVOICE(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var INVOICE_ID string
	var INVOICE_KEY string
	var PO_ID string
	var SELLER string
	INVOICE_MARSHAL := INVOICE_INFORMATION{}
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments  Expecting name of the person to query")
	}
	INVOICE_ID = args[0]
	PO_ID = args[1]
	SELLER = args[2]
	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
	INVOICE_DATA, err := stub.GetState(INVOICE_KEY)
	if err != nil {
		return shim.Error("get invoice error")
	}
	if INVOICE_DATA == nil {
		return shim.Error("Invoice No Information ")
	}
	json.Unmarshal(INVOICE_DATA, &INVOICE_MARSHAL)
	CHECK_SELLER := INVOICE_MARSHAL.SELLER
	if SELLER != CHECK_SELLER {
		return shim.Error("Error Seller not equal")
	}
	return shim.Success(INVOICE_DATA)
}
func (t *FundTransferChaincode) CheckUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var User string
	var err error
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments  ")
	}
	User = args[0]
	IMFORMATION_USER, err := stub.GetState(User)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if IMFORMATION_USER == nil {
		return shim.Error("Don't have history of User ")
	}
	return shim.Success(IMFORMATION_USER)
}
func (t *FundTransferChaincode) Borrow_Invoice_Seller(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var INVOICE_ID string
	var SELLER string
	var PO_ID string
	var INVOICE_KEY string 
	var err error
	INVOICE_STATUS := INVOICE_INFORMATION{}
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments ")
	}
	INVOICE_ID = args[0]
	PO_ID = args[1]
	SELLER = args[2]
	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
	GET_INVOICE, err := stub.GetState(INVOICE_KEY)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if GET_INVOICE == nil {
		return shim.Error("NO INVOICE")
	}
	json.Unmarshal(GET_INVOICE, &INVOICE_STATUS)
	if INVOICE_STATUS.SELLER != SELLER{
		return shim.Error("permission denied 1")
	}
	FIANANCE := INVOICE_STATUS.FINANCE_SELLER
	if FIANANCE != "NO"{
		return shim.Error("This invoice has already been borrowed ")
	}else{
		FIANANCE = "already been borrowed"
	}
	fmt.Println(FIANANCE)

	var INVOICE_INFORMATION = INVOICE_INFORMATION{ ///เก็บค่าลง invoice
		INVOICE_ID:        INVOICE_ID,
		PO_ID:             PO_ID,
		RECEIVED_DAY:      INVOICE_STATUS.RECEIVED_DAY,
		SELLER:            SELLER,
		NUM_SENT:          INVOICE_STATUS.NUM_SENT,
		INSTALLMENT_PRICE: INVOICE_STATUS.INSTALLMENT_PRICE,
		ALL_PRODUCTS:      INVOICE_STATUS.ALL_PRODUCTS,
		ALL_PRICE:         INVOICE_STATUS.ALL_PRICE,
		FINANCE_SELLER:	   FIANANCE,
		FINANCE_BUYER:	   INVOICE_STATUS.FINANCE_BUYER,
		NUM:               INVOICE_STATUS.NUM,
		PO_INFORMATION:    INVOICE_STATUS.PO_INFORMATION,
	}
	INVOICE_MARSHAL, err := json.Marshal(INVOICE_INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat PO")
	}
	if INVOICE_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(INVOICE_KEY, INVOICE_MARSHAL)
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	return shim.Success(INVOICE_MARSHAL)
}

func (t *FundTransferChaincode) Borrow_Invoice_Buyer(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var INVOICE_ID string
	var BUYER string
	var PO_ID string
	var INVOICE_KEY string 
	var err error
	INVOICE_STATUS := INVOICE_INFORMATION{}
	CHECK_PO := PO_INFORMATION{}
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments ")
	}
	INVOICE_ID = args[0]
	PO_ID = args[1]
	BUYER = args[2]
	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
	BUYER_ID, err := stub.GetState(PO_ID)
	json.Unmarshal(BUYER_ID, &CHECK_PO)
	if CHECK_PO.BUYER != BUYER{
		return shim.Error("permission denied 2")
	}
	GET_INVOICE, err := stub.GetState(INVOICE_KEY)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if GET_INVOICE == nil {
		return shim.Error("NO INVOICE")
	}
	json.Unmarshal(GET_INVOICE, &INVOICE_STATUS)
	FIANANCE := INVOICE_STATUS.FINANCE_BUYER
	if FIANANCE != "NO"{
		return shim.Error("This invoice has already been borrowed ")
	}else{
		FIANANCE = "already been borrowed"
	}
	fmt.Println(FIANANCE)

	var INVOICE_INFORMATION = INVOICE_INFORMATION{ ///เก็บค่าลง invoice
		INVOICE_ID:        INVOICE_ID,
		PO_ID:             PO_ID,
		RECEIVED_DAY:      INVOICE_STATUS.RECEIVED_DAY,
		SELLER:            INVOICE_STATUS.SELLER,
		NUM_SENT:          INVOICE_STATUS.NUM_SENT,
		INSTALLMENT_PRICE: INVOICE_STATUS.INSTALLMENT_PRICE,
		ALL_PRODUCTS:      INVOICE_STATUS.ALL_PRODUCTS,
		ALL_PRICE:         INVOICE_STATUS.ALL_PRICE,
		FINANCE_SELLER:	   INVOICE_STATUS.FINANCE_SELLER,
		FINANCE_BUYER:	   FIANANCE,
		NUM:               INVOICE_STATUS.NUM,
		PO_INFORMATION:    INVOICE_STATUS.PO_INFORMATION,
	}
	INVOICE_MARSHAL, err := json.Marshal(INVOICE_INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal creat PO")
	}
	if INVOICE_MARSHAL == nil {
		return shim.Error("Marshal havn't value")
	}
	err = stub.PutState(INVOICE_KEY, INVOICE_MARSHAL)
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	return shim.Success(INVOICE_MARSHAL)
}
func (t *FundTransferChaincode) BorrowPO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var PO_ID string
	var SELLER string
	PO_UNMARSHAL := PO_INFORMATION{}
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments  Expecting name of the person to query")
	}
	PO_ID = args[0]
	SELLER = args[1]
	PO_DATA, err := stub.GetState(PO_ID)
	if err != nil {
		return shim.Error("can't getstate")
	}
	if PO_DATA == nil {
		return shim.Error("PO  No Information ")
	}
	json.Unmarshal(PO_DATA, &PO_UNMARSHAL)
	CHECK_FINANCIAL := PO_UNMARSHAL.FINANCIAL_STATUS
	fmt.Println(CHECK_FINANCIAL)
	if CHECK_FINANCIAL != "NO" {
		return shim.Error("this PO  has been borrowed")
	}
	if SELLER != PO_UNMARSHAL.SELLER {
		return shim.Error("this user not equal")
	}
	BORROW := "Borrowed"
	PO_UNMARSHAL.FINANCIAL_STATUS = BORROW
	PO_MARSHAL, err := json.Marshal(PO_UNMARSHAL)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal PO")
	}
	err = stub.PutState(PO_ID, PO_MARSHAL) ///เอาค่าที่เพิ่มใส่ลง
	if err != nil {
		fmt.Print(err)
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
