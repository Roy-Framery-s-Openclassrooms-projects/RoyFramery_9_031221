import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";
import { bills } from "../fixtures/bills.js";
import "@testing-library/jest-dom/extend-expect";
import firestore from "../app/Firestore.js";
// jest.mock("../app/Firestore.js")

describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        const html = NewBillUI();
        document.body.innerHTML = html;
    });

    describe("When I am on NewBill Page", () => {
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
                const inputType = screen.getByTestId("expense-type");
                expect(inputType.value).toBe("Transports");

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
                const handleSubmit = jest.fn((e) => e.preventDefault());

                form.addEventListener("submit", handleSubmit);
                fireEvent.submit(form);
                expect(screen.getByTestId("form-new-bill")).toBeTruthy();
            });
        });

        describe("When I do fill required fileds in good format and I click on submit button", () => {
            
            test("Then it should render the bills page", () => {
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

                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                const user = JSON.stringify({
                    type: "Employee",
                    email: "johnedoe@email.com",
                });
                window.localStorage.setItem("user", user);

                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname, data: bills });
                };
                const firestore = null;
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

            // test('Then It should create a new bill', () => {
            //     const onNavigate = (pathname) => {
            //         document.body.innerHTML = ROUTES({ pathname, data: bills });
            //     };
            //     const newBill = new NewBill({
            //         document,
            //         onNavigate,
            //         firestore : firestore,
            //         localstorage: null
            //     });
            //     const bill = [{
            //         email: "a@a",
            //         type: "Transports",
            //         name:  "name",
            //         amount: "300",
            //         date:  "2021-12-22",
            //         vat: "20",
            //         pct: "20",
            //         commentary: "",
            //         fileUrl: "https//projet9.com",
            //         fileName: "Image.jpg",
            //         status: 'pending'
            //     }];

            //     const createBill = jest.fn(newBill.createBill(bill));
            //     // createBill(bill);

            //     // expect(createBill(bill)).toHaveBeenCalled();
            // })
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
                };

                const inputFile = screen.getByTestId("file");
                fireEvent.change(inputFile, {
                    target: {
                        files: [
                            new File(["image"], inputData.file, {
                                type: "image/png",
                            }),
                        ],
                    },
                });
                const authorizedFileType = [
                    'image/png'
                ];
                expect(authorizedFileType).toContain(inputFile.files[0].type)
            });
            test("Then It should display the file name in the input", () => {
                const inputData = {
                    file: "image.png",
                };
                const newBill = new NewBill ({
                    document, 
                    // firestore : jest.mock("../app/Firestore.js", () => {
                    //     return {
                    //         storage : jest.fn()
                    //     }
                    // })
                    firestore : jest.fn().mockImplementation(() => {
                        return {
                            storage: jest.fn().mockImplementation(() => {
                                return {
                                    ref: jest.fn()
                                }
                            })
                        }
                    })
                })
                const handleChangeFile = jest.fn(newBill.handleChangeFile)
                const inputFile = screen.getByTestId("file");
                inputFile.addEventListener("change", handleChangeFile)
                fireEvent.change(inputFile, {
                    target: {
                        files: [
                            new File(["image"], inputData.file, {
                                type: "image/png",
                            }),
                        ],
                    },
                });
                const authorizedFileType = [
                    'image/png'
                ];
                expect(authorizedFileType).toContain(inputFile.files[0].type);
                expect(inputFile.parentNode).toHaveAttribute(
                    "data-error-visible",
                    "false"
                );
            });
        });
    });
});
