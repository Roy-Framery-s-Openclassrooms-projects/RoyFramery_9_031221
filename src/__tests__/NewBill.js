import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";


describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        describe('When I do not fill fields and I click on send button', () => {
            test("Then It should renders NewBill page", () => {
                const html = NewBillUI();
                document.body.innerHTML = html;
    
                const inputType = screen.getByTestId('expense-type');
                expect(inputType.value).toBe("Transports")
    
                const inputName = screen.getByTestId('expense-name');
                expect(inputName.getAttribute('placeholder')).toBe("Vol Paris Londres");
                expect(inputName.value).toBe("");
    
                const inputDate = screen.getByTestId('datepicker');
                expect(inputDate.value).toBe("");
                
                const inputAmount = screen.getByTestId('amount');
                expect(inputAmount.getAttribute('placeholder')).toBe("348");
                expect(inputAmount.value).toBe("");
                
                const inputVat = screen.getByTestId('vat');
                expect(inputVat.getAttribute('placeholder')).toBe("70");
                expect(inputVat.value).toBe("");
    
                const inputPct = screen.getByTestId('pct');
                expect(inputPct.getAttribute('placeholder')).toBe("20");
                expect(inputPct.value).toBe("");
    
                const inputComment = screen.getByTestId('commentary');
                expect(inputComment.value).toBe("");
    
                const inputFile = screen.getByTestId('file');
                expect(inputFile.value).toBe("");
    
                const form = screen.getByTestId("form-new-bill");
                const handleSubmit = jest.fn(e => e.preventDefault());
                
                form.addEventListener("submit", handleSubmit);
                fireEvent.submit(form);
                expect(screen.getByTestId("form-new-bill")).toBeTruthy();
            });
        });

        describe('When I do fill all required fileds in good format and I click on submit button', () => {
            test("Then It should create a new billa and render the bills page", () => {
                const html = NewBillUI();
                document.body.innerHTML = html;
                const inputData = {
                    expense: 'Transports',
                    date: "2021-12-22",
                    amount: "310",
                    vat : "0",
                    pct: "20",
                    file: 'image.jpg'
                };
                const inputType = screen.getByTestId('expense-type');
                fireEvent.change(inputType, { target: { value: inputData.expense } });
                expect(inputType.value).toBe(inputData.expense);
    
                const inputDate = screen.getByTestId('datepicker');
                fireEvent.change(inputDate, { target: { value: inputData.date } });
                expect(inputDate.value).toBe(inputData.date);
    
                const inputAmount = screen.getByTestId('amount');
                fireEvent.change(inputAmount, { target: { value: inputData.amount } });
                expect(inputAmount.value).toBe(inputData.amount);
    
                const inputPct = screen.getByTestId('pct');
                fireEvent.change(inputPct, { target: { value: inputData.pct } });
                expect(inputPct.value).toBe(inputData.pct);
                const inputVat = screen.getByTestId('vat');
                fireEvent.change(inputVat, { target: { value: inputData.vat } });
                expect(inputVat.value).toBe(inputData.vat);
    
                const inputFile = screen.getByTestId('file');
                fireEvent.change(inputFile, { target: { files: [new File(['(⌐□_□)'], inputData.file, {type: 'image/jpg'})] } });
                expect(inputFile.files[0].name).toBe(inputData.file);

                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                const user = JSON.stringify({
                    type: "Employee",
                    email: "johnedoe@email.com",
                });
                window.localStorage.setItem("user", user);
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({pathname})
                }
                const firestore = null;
                const newBill = new NewBill({
                    document,
                    onNavigate,
                    firestore,
                    localstorage : window.localstorage
                });
                const submitButton = screen.getByText('Envoyer');
                const handleSubmit = jest.fn(newBill.handleSubmit);
                submitButton.addEventListener('click', handleSubmit);
                userEvent.click(submitButton);
                expect(handleSubmit).toHaveBeenCalled();
            })            
        })
        
        describe("When I'm adding a file to the input in wrong format", () => {
            test('Then It should show an error message', () => {
                
            })
            test('Then It should show the file name in the input', () => {
                
            })
            
        })
        

    });
});
