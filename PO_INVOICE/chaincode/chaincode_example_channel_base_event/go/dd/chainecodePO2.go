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
	USER_ID      string
	USER_HISTORY []string //IN STRING IS PO DATA
}
type PO_INFORMATION struct {
	PO_ID       string `jason:"PO_ID"`
	BUYER       string
	PRODUCT     string
	PRICE       string //ALL PRICE
	DATE        string
	SELLER      string
	NUM_PRODUCT string //ALL PRODUCT WANT
	LOT         string //จำนวนล็อตที่ส่ง
	STATUS		string
	ALL_INVOICE []string 
	I_I []string 
}
type INVOICE_INFORMATION struct {
	INVOICE_ID        string
	PO_ID             string
	SELLER            string
	NUM_SENT          string
	INSTALLMENT_PRICE string
	RECEIVED_DAY      string
	PRODUCT           string
	PRICE             string
	ALL_PRODUCTS      string
	ALL_PRICE         string
	NUM               string
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
		return shim.Error("Incorrect NUMber of arguments. ")
	}
	STATUS = "Waiting for response"
	HISTORY := USER_INFORMATION{}
	PO_ID = args[0]
	BUYER = args[1]
	DATE =args[2]
	PRODUCT = args[3]
	NUM_PRODUCT = args[4]
	PRICE = args[5]
	SELLER = args[6]
	LOT = args[7]
	// DATE_TIME := time.Now()
	returntoeven := linePO + "\nPO_ID = " + PO_ID + "\n" + "BUYER = " + BUYER + "\n" + "PRODUCT = " + PRODUCT + "\n" + "NUM_PRODUCT = " + NUM_PRODUCT + "\n" + "PRICE = " + PRICE + "\n" + "DATE = " + DATE+ "\n" + "SELLER = " + SELLER + "\n" + "LOT = " + LOT + "\n" +"STATUS = "+STATUS+"\n"+ line
	CREATE_PO, err := stub.GetState(PO_ID)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if CREATE_PO != nil {
		return shim.Error("PO havn't value ")
	}

	PO_DATA := PO_INFORMATION{
		PO_ID:       PO_ID,
		BUYER:       BUYER,
		PRODUCT:     PRODUCT,
		PRICE:       PRICE,
		DATE:        DATE,
		SELLER:      SELLER,
		NUM_PRODUCT: NUM_PRODUCT,
		LOT:         LOT,
		STATUS:		 STATUS,
		ALL_INVOICE:	ALL_INVOICE,
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
	fmt.Println(linePO)
	fmt.Println("PO_ID = " + PO_ID + "\n" + "BUYER = " + BUYER + "\n" + "PRODUCT = " + PRODUCT + "\n" + NUM_PRODUCT + "\n" + "PRICE = " + PRICE + "\n" + "DATE = " + DATE + "\n" + "SELLER = " + SELLER + "\n" + "LOT = " + LOT + "\n"+"STATUS = "+STATUS+"\n")
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
	NEW_HISTORY = append(NEW_HISTORY, PO_ID) //OR INVOICE_ID
	USER_ID := BUYER
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
	// json.Unmarshal(PO_MARSHAL, &PO_DATA)
	// sent_back, err := stub.GetState(PO_ID)
	fmt.Println(PO_MARSHAL)
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
		return shim.Error("Incorrect NUMber of arguments. ")
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
	INVOICES_LEAVES := SELLER + "$$$" + PO_ID
	CHECK_NUM_INVOICE := INVOICE_ID + "$$$" + PO_ID
	CHEACK_INVOICE_KEY, err := stub.GetState(CHECK_NUM_INVOICE)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state1")
	}
	if CHEACK_INVOICE_KEY != nil {
		return shim.Error("THIS INVOICE HAS NUMBER ")	//////เช็คว่ามีอินวอยใบนี้หรือยัง
	}
	CREATE_INVOICE, err := stub.GetState(INVOICES_LEAVES)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state2")
	}
	i := 1
	if CREATE_INVOICE == nil {
		err = stub.PutState(INVOICES_LEAVES, []byte(strconv.Itoa(1)))/////เช็คว่ามีใบนี้หรือยัง  ถ้ายังจะกำหนดเป็นใบที่ 1
		if err != nil {
			return shim.Error("Expecting integer value for asset holding")
		}
	} else {
		NUM, err := strconv.Atoi(string(CREATE_INVOICE))///ถ้ามีค่าแล้ว จำนวนใบจะดึงค่าจำนวนใบมา
		if err != nil {
			return shim.Error("can't chang to int")
		}
		for ; NUM != i; i++ {
			fmt.Println(i)/// +i จนถึงจำนวนใบปัจบัน
		}
	}
		err = stub.PutState(INVOICES_LEAVES, []byte(strconv.Itoa(i+1)))/// เก็บค่าจำนวนใบใหม่
		if err != nil {
			return shim.Error("Expecting integer value for asset holding")
	}
	NUM_INVOICE, err := stub.GetState(INVOICES_LEAVES)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't GetState1")
	}

	// NUM_I := string(NUM_INVOICE)
	var NUM_I int
	if NUM_INVOICE != nil {
		NUM_I, err = strconv.Atoi(string(NUM_INVOICE))///ดึงค่าจำนวนใบมาว่าเป็นใบที่เท่าไร ถ้าเป็นครั้งแรกเป็นจะเป็น 0
		if err != nil {
			fmt.Print(err)
			return shim.Error("Can't change string to int 1")
		}
	}
	if CREATE_INVOICE == nil{
		NUM_I = NUM_I+1
	}
	/// ถ้าครั้งแรก ค่าจำนวนใบจะเป็น 0 ครั้งที่ 2 จะเป็น 1  จึง + 1
	CHECK_PO, err := stub.GetState(PO_ID)////เช็คว่ามีใบ PO จริงไหม
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
	PO_DATA.STATUS = "Pending"
	NEW_ALL_INVOICE := PO_DATA.ALL_INVOICE
	NEW_ALL_INVOICE = append(NEW_ALL_INVOICE, INVOICE_ID) ///เพิ่มเลขใบอินวอยในใบพีโอ
	// NEW_PO_INFORMATION := PO_INFORMATION{
	// 	PO_ID:       PO_DATA.PO_ID,
	// 	BUYER:       PO_DATA.BUYER,
	// 	DATE:        PO_DATA.DATE,
	// 	PRODUCT:     PO_DATA.PRODUCT,
	// 	PRICE:       PO_DATA.PRICE,
	// 	SELLER:      PO_DATA.SELLER,
	// 	NUM_PRODUCT: PO_DATA.NUM_PRODUCT,
	// 	LOT:         PO_DATA.LOT,
	// 	STATUS:		 PO_DATA.STATUS,
	// 	ALL_INVOICE: NEW_ALL_INVOICE,
	// 	I_I:		PO_DATA.I_I,
	// }
	// PO_MARSHAL, err := json.Marshal(NEW_PO_INFORMATION)
	// if err != nil {
	// 	fmt.Print(err)
	// 	return shim.Error("Can't Marshal PO")
	// }
	// err = stub.PutState(PO_ID, PO_MARSHAL)///เอาค่าที่เพิ่มใส่ลง
	// if err != nil {
	// 	fmt.Print(err)
	// 	return shim.Error("can't put stub ")
	// }
	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
	CHECK_NUM_SENT, err := stub.GetState(INVOICE_KEY)//ดึงค่าใบอินวอยปัจจุบัน ซึ่งจะไม่มี
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't GetState3")
	}
	CHECK_PO, err = stub.GetState(PO_ID)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't GetState4")
	}
	if CHECK_PO == nil {
		return shim.Error("PO can't find ")
	}
	json.Unmarshal(CHECK_PO, &PO_DATA)
	INVOICE_KEY2 := PO_DATA.ALL_INVOICE
	for i := 0; i < len(INVOICE_KEY2); i++ {
		INVOICE_OLD = INVOICE_KEY2[i] + "$$$" + PO_ID
		fmt.Println(i)
		fmt.Println(INVOICE_OLD)
		fmt.Println("--------------------")
	}

	INVOICE_NUM, err := stub.GetState(INVOICE_OLD)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state3")
	}
	json.Unmarshal(INVOICE_NUM, &EACH_INVOICE)
	CHECK_ALL_PRODUCT := EACH_INVOICE.ALL_PRODUCTS
	CHECK_ALL_PRICE := EACH_INVOICE.ALL_PRICE
	NUM_SENT_data := INVOICE_INFORMATION{}
	json.Unmarshal(CHECK_NUM_SENT, &NUM_SENT_data)
	OLD_ALL_PRODUCTS, err := strconv.Atoi(CHECK_ALL_PRODUCT)
	if err != nil && NUM_I !=1 {
		fmt.Print(err)
		return shim.Error("Can't change string to int2")
	}
	NEW_ALL_PRODUCTS, err := strconv.Atoi(ALL_PRODUCTS)
	if err != nil && NUM_I !=1{
		fmt.Print(err)
		return shim.Error("Can't change string to int3")
	}
	SUM_ALL_PRODUCTS := NEW_ALL_PRODUCTS + OLD_ALL_PRODUCTS
	ALL_PRODUCTS = strconv.Itoa(SUM_ALL_PRODUCTS)
	OLD_ALL_PRICE, err := strconv.Atoi(string(CHECK_ALL_PRICE))
	if err != nil && NUM_I !=1{
		fmt.Print(err)
		return shim.Error("Can't change string to int4")
	}
	NEW_ALL_PRICE, err := strconv.Atoi(string(ALL_PRICE))
	if err != nil && NUM_I !=1{
		fmt.Print(err)
		return shim.Error("Can't change string to int5")
	}
	SUM_ALL_PRICE := NEW_ALL_PRICE + OLD_ALL_PRICE
	ALL_PRICE = strconv.Itoa(SUM_ALL_PRICE)

	NUM := strconv.Itoa(NUM_I)
	NUM_FULL, err := strconv.Atoi(NUM)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't change string to int6")
	}
	LOT_FULL, err := strconv.Atoi(PO_DATA.LOT)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't change string to int7")
	}
	if NUM_FULL > LOT_FULL {
		return shim.Error("The invoice is complete")
	}
			ALL_FULL_PRODUCTS, err := strconv.Atoi(ALL_PRODUCTS)
			if err != nil {
				return shim.Error("Can't change string to int8")
			}
			NUM_FULL_PRODUCT, err := strconv.Atoi(PO_DATA.NUM_PRODUCT)
			if err != nil {
				return shim.Error("Can't change string to int9")
			}
			ALL_PRICR_FULL, err := strconv.Atoi(ALL_PRICE)
			if err != nil {
				return shim.Error("Can't change string to int10")
			}
			PRICE_FULL, err := strconv.Atoi(PO_DATA.PRICE)
			if err != nil {
				return shim.Error("Can't change string to int11")
			}
	if ALL_FULL_PRODUCTS > NUM_FULL_PRODUCT{
		return shim.Error("to many product")
	}
	if ALL_PRICR_FULL > PRICE_FULL{
		return shim.Error("to many price")
	}
	if NUM == PO_DATA.LOT {
		if ALL_PRODUCTS != PO_DATA.NUM_PRODUCT {
			RESULT := NUM_FULL_PRODUCT - ALL_FULL_PRODUCTS
			RESULT_PRODUCT := strconv.Itoa(RESULT)
			return shim.Error("Product must full , Absent  = " + RESULT_PRODUCT)
		} else if ALL_PRICE != PO_DATA.PRICE {
			RESULT := PRICE_FULL - ALL_PRICR_FULL
			RESULT_PRODUCT := strconv.Itoa(RESULT)
			return shim.Error("Price must full, Absent  = " + RESULT_PRODUCT)
		}
		CHECK_PO, err := stub.GetState(PO_ID)////เช็คว่ามีใบ PO จริงไหม
	json.Unmarshal(CHECK_PO, &PO_DATA)
	PO_DATA.STATUS = "Success"
	NEW_PO_INFORMATION := PO_INFORMATION{
		PO_ID:       PO_DATA.PO_ID,
		BUYER:       PO_DATA.BUYER,
		DATE:        PO_DATA.DATE,
		PRODUCT:     PO_DATA.PRODUCT,
		PRICE:       PO_DATA.PRICE,
		SELLER:      PO_DATA.SELLER,
		NUM_PRODUCT: PO_DATA.NUM_PRODUCT,
		LOT:         PO_DATA.LOT,
		STATUS:		 PO_DATA.STATUS,
		ALL_INVOICE: NEW_ALL_INVOICE,
		I_I:		PO_DATA.I_I,
	}
	PO_MARSHAL, err := json.Marshal(NEW_PO_INFORMATION)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal PO")
	}
	err = stub.PutState(PO_ID, PO_MARSHAL)///เอาค่าที่เพิ่มใส่ลง
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}

	}

	var INVOICE_INFORMATION = INVOICE_INFORMATION{
		INVOICE_ID:        INVOICE_ID,
		PO_ID:             PO_ID,
		RECEIVED_DAY:      RECEIVED_DAY,
		SELLER:            SELLER,
		NUM_SENT:          NUM_SENT,
		INSTALLMENT_PRICE: INSTALLMENT_PRICE,
		ALL_PRODUCTS:      ALL_PRODUCTS,
		ALL_PRICE:         ALL_PRICE,
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

	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
	// +"$$$"+NUM

	fmt.Println(INVOICE_KEY + "   keyyyyyyyyyy")
	err = stub.PutState(INVOICE_KEY, INVOICE_MARSHAL)
	if err != nil {
		fmt.Print("err")
		return shim.Error("can't put stub ")
	}
	fmt.Println(lineIvoice)
	fmt.Println("INVOICE_ID = " + INVOICE_ID + "\n" + "SELLER = " + SELLER + "\n" + "PRODUCT = " + PO_DATA.PRODUCT + "\n" + "PRICE = " + PO_DATA.PRICE + "\n" + "RECEIVED_DAY = " + RECEIVED_DAY + "\n" + "PO_ID =  " + PO_ID + "\n" + "BUYER = " + PO_DATA.BUYER + "\n" + "NUM_SENT = " + NUM_SENT + "\n" + "INSTALLMENT_PRICE = " + INSTALLMENT_PRICE + "\n" + "ALL_PRODUCTS = " + ALL_PRODUCTS + "\n" + "ALL_PRICE = " + ALL_PRICE + "\n" + "NUM_INVOICE = " + NUM)
	fmt.Println(line)
	returntoeven := lineIvoice + "\nINVOICE_ID = " + INVOICE_ID + "\n" + "SELLER = " + SELLER + "\n" + "PRODUCT = " + PO_DATA.PRODUCT + "\n" + "PRICE = " + PO_DATA.PRICE + "\n" + "RECEIVED_DAY = " + RECEIVED_DAY + "\n" + "PO_ID =  " + PO_ID + "\n" + "BUYER = " + PO_DATA.BUYER + "\n" + "NUM_SENT = " + NUM_SENT + "\n" + "INSTALLMENT_PRICE = " + INSTALLMENT_PRICE + "\n" + "ALL_PRODUCTS = " + ALL_PRODUCTS + "\n" + "ALL_PRICE = " + ALL_PRICE + "\n" + "NUM_INVOICE = " + NUM + "\n" + line
	returntoeven2 := "INVOICE_ID = " + INVOICE_ID + "	" + "SELLER = " + SELLER + "	" + "PRODUCT = " + PO_DATA.PRODUCT + "	" + "PRICE = " + PO_DATA.PRICE + "	" + "RECEIVED_DAY = " + RECEIVED_DAY + "	" + "PO_ID =  " + PO_ID + "\n" + "BUYER = " + PO_DATA.BUYER + "	" + "NUM_SENT = " + NUM_SENT + "	" + "INSTALLMENT_PRICE = " + INSTALLMENT_PRICE + "	" + "ALL_PRODUCTS = " + ALL_PRODUCTS + "	" + "ALL_PRICE = " + ALL_PRICE + "	" + "NUM_INVOICE = " + NUM
	II := PO_DATA.I_I
	II = append(II, returntoeven2) ///เพิ่มเลขใบอินวอยในใบพีโอ
	III := PO_INFORMATION{
		PO_ID:       PO_DATA.PO_ID,
		BUYER:       PO_DATA.BUYER,
		DATE:        PO_DATA.DATE,
		PRODUCT:     PO_DATA.PRODUCT,
		PRICE:       PO_DATA.PRICE,
		SELLER:      PO_DATA.SELLER,
		NUM_PRODUCT: PO_DATA.NUM_PRODUCT,
		LOT:         PO_DATA.LOT,
		STATUS:		 PO_DATA.STATUS,
		ALL_INVOICE: PO_DATA.ALL_INVOICE,
		I_I:		NEW_ALL_INVOICE,
	}
	PO_MARSHAL, err := json.Marshal(III)
	if err != nil {
		fmt.Print(err)
		return shim.Error("Can't Marshal PO")
	}
	err = stub.PutState(PO_ID, PO_MARSHAL)///เอาค่าที่เพิ่มใส่ลง
	if err != nil {
		fmt.Print(err)
		return shim.Error("can't put stub ")
	}
	
	
	Payload := []byte(returntoeven)
	stub.SetEvent("event", Payload)
	/////////////////////////////
	IMFORMATION_USER, err := stub.GetState(SELLER)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	json.Unmarshal(IMFORMATION_USER, &HISTORY)
	NEW_HISTORY := HISTORY.USER_HISTORY
	NEW_HISTORY = append(NEW_HISTORY, INVOICE_ID) //OR INVOICE_ID
	USER_ID := SELLER
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
	var BUYER string
	PO_MARSHAL := PO_INFORMATION{}
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting name of the person to query")
	}
	PO_ID = args[0]
	BUYER = args[1]
	// Userkey := wallet + "$$$" + User
	// Get the state from the ledger
	PO_DATA, err := stub.GetState(PO_ID)
	if err != nil {
		return shim.Error("can't getstate")
	}
	if PO_DATA == nil {
		return shim.Error("Po data nil")
	}
	json.Unmarshal(PO_DATA, &PO_MARSHAL)
	CHECK_BUYER := PO_MARSHAL.BUYER
	if BUYER != CHECK_BUYER {
		return shim.Error("Error Buyer not equal")
	}

	jsonResp := "{\"PO_ID\":\"" + PO_ID + "\",\"\nPURCHASE ORDER\":\"" + string(PO_DATA) + "\"}"
	fmt.Printf("Query Response:%s\n", jsonResp)
	fmt.Println(PO_DATA)
	return shim.Success(PO_DATA)
}
func (t *FundTransferChaincode) CheckINVOICE(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var INVOICE_ID string
	var INVOICE_KEY string
	var PO_ID string
	var SELLER string
	INVOICE_MARSHAL := INVOICE_INFORMATION{}
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting name of the person to query")
	}
	INVOICE_ID = args[0]
	PO_ID = args[1]
	SELLER = args[2]
	INVOICE_KEY = INVOICE_ID + "$$$" + PO_ID
	INVOICE_DATA, err := stub.GetState(INVOICE_KEY)
	if err != nil {
		// jsonResp := "{\"Error\":\"Failed to get state for PO_ID " + INVOICE_ID + "\"}"
		return shim.Error("get invoice error")
	}

	if INVOICE_DATA == nil {
		// jsonResp := "{\"Error\":\"Nil Value for PO_ID " + INVOICE_ID + "\"}"
		// fmt.Printf("Entity not found")
		return shim.Error("***********------------******************")
	}
	fmt.Println(SELLER)
	json.Unmarshal(INVOICE_DATA, &INVOICE_MARSHAL)
	// CHECK_SELLER := INVOICE_MARSHAL.SELLER
	// if SELLER != CHECK_SELLER {
	// 	return shim.Error("Error Seller not equal")
	// }

	jsonResp := "{\"INVOICE_ID\":\"" + INVOICE_ID + "\",\"\nINVOICE \":\"" + string(INVOICE_DATA) + "\"}"
	fmt.Printf("Query Response:%s\n", jsonResp)
	return shim.Success(INVOICE_DATA)
}
func (t *FundTransferChaincode) CheckUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var User string
	var err error
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. ")
	}
	HISTORY_UNMARSHAL := USER_INFORMATION{}
	User = args[0]
	IMFORMATION_USER, err := stub.GetState(User)
	if err != nil {
		fmt.Println(err)
		return shim.Error("Failed to get state")
	}
	if IMFORMATION_USER == nil {
		return shim.Error("Don't have history of User ")
	}
	json.Unmarshal(IMFORMATION_USER, &HISTORY_UNMARSHAL)
	HISTORY := HISTORY_UNMARSHAL.USER_HISTORY
	for i := 0; i < len(HISTORY); i++ {
		show_data := HISTORY[i]
		fmt.Println(show_data)
	}
	return shim.Success(IMFORMATION_USER)
}

func main() {
	err := shim.Start(new(FundTransferChaincode))
	if err != nil {
		fmt.Printf("Error starting FundTransfer chaincode: %s", err)
	}
}
