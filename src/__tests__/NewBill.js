import { fireEvent, screen } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { bills } from "../fixtures/bills.js";
import "@testing-library/jest-dom/extend-expect";
import firestore from "../app/Firestore.js";
import Router from "../app/Router.js";
import firebase from '../__mocks__/firebase.js';
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
    
    describe("When I am on NewBill Page", () => {
        beforeEach(() => {
            const user = JSON.stringify({ 
                type: "Employee",
                email : 'a@a',
            });
            window.localStorage.setItem("user", user);
    
            const pathname = ROUTES_PATH["NewBill"];
            Object.defineProperty(window, "location", {
                value: {
                    hash: pathname
                }
            });
    
            document.body.innerHTML = `<div id="root"></div>`;
            Router();
    
        });
        test("Then input date is required ", () => {
            const inputDate = screen.getByTestId("datepicker");
            expect(inputDate).toBeRequired();
        });
        test("Then input amount is required ", () => {
            const inputAmount = screen.getByTestId("amount");
            expect(inputAmount).toBeRequired();
        });
        test("Then input amount is required ", () => {
            const inputPct = screen.getByTestId("pct");
            expect(inputPct).toBeRequired();
        });
        test("Then input amount is required ", () => {
            const inputfile = screen.getByTestId("file");
            expect(inputfile).toBeRequired();
        });

        describe("When I do not fill fields and I click on send button", () => {
            test("Then It should renders NewBill page", () => {

                const inputName = screen.getByTestId("expense-name");
                expect(inputName.getAttribute("placeholder")).toBe(
                    "Vol Paris Londres"
                );
                expect(inputName.value).toBe("");

                const inputDate = screen.getByTestId("datepicker");
                expect(inputDate.value).toBe("");

                const inputAmount = screen.getByTestId("amount");
                expect(inputAmount.getAttribute("placeholder")).toBe("348");
                expect(inputAmount.value).toBe("");

                const inputVat = screen.getByTestId("vat");
                expect(inputVat.getAttribute("placeholder")).toBe("70");
                expect(inputVat.value).toBe("");

                const inputPct = screen.getByTestId("pct");
                expect(inputPct.getAttribute("placeholder")).toBe("20");
                expect(inputPct.value).toBe("");

                const inputComment = screen.getByTestId("commentary");
                expect(inputComment.value).toBe("");

                const inputFile = screen.getByTestId("file");
                expect(inputFile.value).toBe("");

                const form = screen.getByTestId("form-new-bill");
                userEvent.click(form);
                expect(screen.getByTestId("form-new-bill")).toBeTruthy();
            });
        });

        describe("When I do fill required fileds in good format and I click on submit button", () => {
            
            test("Then it should render the bills page", () => {
                firestore.storage.ref = jest.fn().mockImplementation(() => {
                    return {
                        put: jest.fn().mockImplementation((e) => {
                            return {
                                then : jest.fn().mockResolvedValue(),
                            }
                        }),
                    }
                });
                firestore.bills = () => ({ 
                    get: jest.fn().mockResolvedValue(),
                    add: jest.fn().mockResolvedValue() 
                });

                const inputData = {
                    expense: "Transports",
                    date: "2021-12-22",
                    amount: "310",
                    pct: "20",
                    file: "image.jpg",
                };

                const inputType = screen.getByTestId("expense-type");
                expect(inputType.value).toBe(inputData.expense);

                const inputDate = screen.getByTestId("datepicker");
                fireEvent.change(inputDate, {
                    target: { value: inputData.date },
                });
                expect(inputDate.value).toBe(inputData.date);

                const inputAmount = screen.getByTestId("amount");
                fireEvent.change(inputAmount, {
                    target: { value: inputData.amount },
                });
                expect(inputAmount.value).toBe(inputData.amount);

                const inputPct = screen.getByTestId("pct");
                fireEvent.change(inputPct, {
                    target: { value: inputData.pct },
                });
                expect(inputPct.value).toBe(inputData.pct);

                const inputFile = screen.getByTestId("file");
                fireEvent.change(inputFile, {
                    target: {
                        files: [
                            new File(["(⌐□_□)"], inputData.file, {
                                type: "image/jpg",
                            }),
                        ],
                    },
                });

                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname, data: bills });
                };

                const newBill = new NewBill({
                    document,
                    onNavigate,
                    firestore,
                });
                const submitButton = screen.getByText("Envoyer");
                const handleSubmit = jest.fn(newBill.handleSubmit);
                submitButton.addEventListener("click", handleSubmit);
                userEvent.click(submitButton);

                expect(handleSubmit).toHaveBeenCalled();

                const billsPage = screen.getByText("Mes notes de frais");
                expect(billsPage).toBeTruthy();
            });
        });

        describe("When I select a file in wrong format (not jpg, jpeg or png)", () => {
            test("Then It the input's file value should be empty and an error message should be visible", () => {
                const newBill = new NewBill({
                    document,
                });

                const inputData = {
                    file: "pdf.pdf",
                };

                const handleChangeFile = jest.fn(newBill.handleChangeFile);
                const inputFile = screen.getByTestId("file");
                inputFile.addEventListener("change", handleChangeFile);

                fireEvent.change(inputFile, {
                    target: {
                        files: [
                            new File(["image"], inputData.file, {
                                type: "application/pdf",
                            }),
                        ],
                    },
                });

                expect(inputFile.parentNode).toHaveAttribute(
                    "data-error-visible",
                    "true"
                );
                expect(inputFile.value).toEqual("");
            });
        });

        describe("When I select a file in good format (jpg, jpeg or png)", () => {
            test("Then It should display the file name in the input", () => {
                const inputData = {
                    file: "image.png",
                    type : 'image/png'
                };
                const newBill = new NewBill({
                    document,
                    firestore
                });

                const handleChangeFile = jest.fn(newBill.handleChangeFile);
                const inputFile = screen.getByTestId("file");
                inputFile.addEventListener("change", handleChangeFile);
                
                fireEvent.change(inputFile, {
                    target: {
                        files: [
                            new File(["image"], inputData.file, {
                                type: inputData.type,
                            }),
                        ],
                    },
                });

                expect(inputFile.parentNode).toHaveAttribute(
                    "data-error-visible",
                    "false"
                );
                expect(inputFile.files[0].name).toBe(inputData.file);
            });
        });
    });
});

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
    describe("When I do fill required fileds in good format and I click on submit button", () => {
        test("Then Add new bill to mock API POST", async () => {
            const getSpyBills = jest.spyOn(firebase, "get")
            const billsData = await firebase.get()
            const bill = {
                email: 'a@a',
                type: 'Transports',
                name:  'Train Paris-Suisse',
                amount: '160€',
                date:  '2021-12-24',
                vat: 0,
                pct: 20,
                commentary: "",
                fileUrl: 'https://stockimage.com/image.png',
                fileName: 'image.png',
                status: 'pending'
            }

            const getSpyAddBill = jest.spyOn(firebase, "post")
            const addedBill = await firebase.post(billsData, bill)
            
            expect(getSpyBills).toHaveBeenCalledTimes(1)
            expect(getSpyAddBill).toHaveBeenCalledTimes(1)
            expect(addedBill.data.length).toBe(5)
        });

        test("Then add bill to an API and fails with 404 message error", async () => {
            firebase.post.mockImplementationOnce(() =>
                Promise.reject(new Error("Erreur 404"))
            )
            const html = BillsUI({ error: "Erreur 404" })
            document.body.innerHTML = html
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
        });

        test("Then add bill to an API and fails with 500 message error", async () => {
            firebase.post.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 500"))
            )
            const html = BillsUI({ error: "Erreur 500" })
            document.body.innerHTML = html
            const message = await screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
        });
    });
});