import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import { ROUTES } from "../constants/routes";
import firebase from "../__mocks__/firebase";


describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            const user = JSON.stringify({
                type: "Employee",
            });
            window.localStorage.setItem("user", user);
            const html = BillsUI({ data: [] });
            document.body.innerHTML = html;
            const icon = screen.getByTestId("icon-window");
            icon.setAttribute("class", "active-icon");
            expect(icon.classList.contains("active-icon")).toBe(true);
        });

        test("then the loader must appear before the tickets are displayed", () => {
            const html = BillsUI({ loading: true });
            document.body.innerHTML = html;
            expect(screen.getAllByText("Loading...")).toBeTruthy();
        });

        test("then the error message must appear if the tickets can't be displayed", () => {
            const html = BillsUI({ error: "some error message" });
            document.body.innerHTML = html;
            expect(screen.getAllByText("Erreur")).toBeTruthy();
        });

        test("Then bills should be ordered from earliest to latest", () => {
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });
    
    describe("When I click on an icon eye", () => {
        test("Then a modal should open", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            const user = JSON.stringify({
                type: "Employee",	            
            });
            window.localStorage.setItem("user", user);

            const html = BillsUI({ data: bills[0] });
            document.body.innerHTML = html;

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const firestore = null;
            const billsClass = new Bills({
                document,
                onNavigate,
                firestore,
                localStorage: window.localStorage
            });

            const eye = screen.getByTestId('icon-eye');
            const handleClickIconEye = jest.fn(billsClass.handleClickIconEye(eye));
            eye.addEventListener("click", handleClickIconEye);
            userEvent.click(eye);
            expect(handleClickIconEye).toHaveBeenCalled();

            const modale = screen.getByTestId("modaleFileEmployee");
            expect(modale).toBeTruthy();
        });
    });

    describe("When I click on New bill button", () => {
        test("Then It should renders NewBill page", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            const user = JSON.stringify({
                type: "Employee",
            });
            window.localStorage.setItem("user", user);

            const html = BillsUI({ data: [] });
            document.body.innerHTML = html;

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const firestore = null;
            const billsClass = new Bills({
                document,
                onNavigate,
                firestore,
                localStorage: window.localStorage,
            });

            const handleClickNewBill = jest.fn(billsClass.handleClickNewBill);
            const newBillButton = screen.getByTestId("btn-new-bill");
            newBillButton.addEventListener("click", handleClickNewBill);
            userEvent.click(newBillButton);
            expect(handleClickNewBill).toHaveBeenCalled();
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });
    });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
        test("fetches bills from mock API GET", async () => {
            const getSpy = jest.spyOn(firebase, "get");
            const bills = await firebase.get();
            expect(getSpy).toHaveBeenCalledTimes(1);
            expect(bills.data.length).toBe(4);
        });
        test("fetches bills from an API and fails with 404 message error", () => {
            firebase.get.mockImplementationOnce(() =>
                Promise.reject(new Error("Erreur 404"))
            );
            const html = BillsUI({ error: "Erreur 404" });
            document.body.innerHTML = html;
            const message = screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });
        test("fetches messages from an API and fails with 500 message error", () => {
            firebase.get.mockImplementationOnce(() =>
                Promise.reject(new Error("Erreur 500"))
            );
            const html = BillsUI({ error: "Erreur 500" });
            document.body.innerHTML = html;
            const message = screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
    });
});
