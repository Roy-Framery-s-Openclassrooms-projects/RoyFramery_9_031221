
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
    constructor({ document, onNavigate, firestore, localStorage }) {
        this.document = document;
        this.onNavigate = onNavigate;
        this.firestore = firestore;
        
        const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
        formNewBill.addEventListener("submit", this.handleSubmit);

        const file = this.document.querySelector(`input[data-testid="file"]`);
        file.addEventListener("change", this.handleChangeFile);
        this.fileUrl = null
        this.fileName = null
        new Logout({ document, localStorage, onNavigate })
    }

    handleChangeFile = e => {
        const fileTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        const fileInputParent = this.document.querySelector(`input[data-testid="file"]`).parentNode;
        const fileInput = this.document.querySelector(`input[data-testid="file"]`)
        const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
        const fileName = file.name;
        if (fileTypes.includes(file.type)) {
            this.firestore
                .storage
                .ref(`justificatifs/${fileName}`)
                .put(file)
                .then(snapshot => snapshot.ref.getDownloadURL())
                .then(url => {
                    this.fileUrl = url;
                    this.fileName = fileName;
                });
            fileInputParent.setAttribute("data-error-visible", false);
        } else {
            fileInputParent.setAttribute("data-error-visible", true);
            fileInput.value = ''
        }
    }

    handleSubmit = e => {
        e.preventDefault()
        // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
        const email = JSON.parse(localStorage.getItem("user")).email
        const bill = {
            email,
            type: this.document.querySelector(`select[data-testid="expense-type"]`).value,
            name:  this.document.querySelector(`input[data-testid="expense-name"]`).value,
            amount: parseInt(this.document.querySelector(`input[data-testid="amount"]`).value),
            date:  this.document.querySelector(`input[data-testid="datepicker"]`).value,
            vat: this.document.querySelector(`input[data-testid="vat"]`).value || 0,
            pct: parseInt(this.document.querySelector(`input[data-testid="pct"]`).value) || 20,
            commentary: this.document.querySelector(`textarea[data-testid="commentary"]`).value || "",
            fileUrl: this.fileUrl,
            fileName: this.fileName,
            status: 'pending'
        }
        this.createBill(bill)
        this.onNavigate(ROUTES_PATH['Bills'])
    }

    // not need to cover this function by tests
    createBill = (bill) => {
        if (this.firestore) {
        this.firestore
        .bills()
        .add(bill)
        .then(() => {
            this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch(error => error)
        }
    }
}