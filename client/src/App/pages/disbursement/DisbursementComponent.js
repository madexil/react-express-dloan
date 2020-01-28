import React, { Component } from 'react';
import { Button, Col, Container, Form, FormGroup, Input, Label, Row, Table, Modal ,ModalBody,ModalHeader} from 'reactstrap';
import DynamicHeader from '../Header.js';
import inputModel from './model.json';
import utility from '../Utility.js';
import SpinnerLoader from '../loading.js';

const cloneDeep = require('lodash.clonedeep');
let installmentAmount = "";
let numberOfPayment = "";
let dataArray = [];

class disbursementComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rq_body: {
                account_number: "",
                disbursement_amount: 0,
                effective_date: "",
                channel_post_date: "",
                currency_code: "THB",
                service_branch: 0,
                clearing_and_settlement_key: "",
                other_properties: {
                    interest_index: "",
                    interest_spread: 0,
                    first_payment_date: "",
                    number_of_payment: 0,
                    installment_amount: 0,
                    payment_calculation_method: "",
                    interest_override_reason: "",
                    campaign_name: "",
                    interest_schedule: []
                }
            },
            loading: false,
            disabled: "",
            openMyModal: false,
            date: "",
            interest_index: "FIXED",
            interest_spread: "",
            isFound: false

        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeModal = this.handleChangeModal.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    };

    componentDidMount() {
        let disbursementAmount = 0;
        let accountNumber = "";

        if ((JSON.parse(sessionStorage.getItem("disburse_interest")))) {
            sessionStorage.removeItem("disburse_interest")
        }

        if (JSON.parse(sessionStorage.getItem("response_installment"))) {
            const dataInstallment = JSON.parse(sessionStorage.getItem("response_installment"));
            installmentAmount = dataInstallment.rs_body.installment_amount;
        } else {
            console.log("sessionStorage response_installment not found!");
        }

        if (JSON.parse(sessionStorage.getItem("request_disbursement"))) {
            const inputDisbursement = JSON.parse(sessionStorage.getItem("request_disbursement"));
            disbursementAmount = inputDisbursement.disbursement_amount;
            numberOfPayment = inputDisbursement.number_of_payment;
        } else {
            console.log("sessionStorage request_disbursement not found!");
        }

        if (JSON.parse(sessionStorage.getItem("account_number"))) {
            const account = JSON.parse(sessionStorage.getItem("account_number"));
            accountNumber = account;
        } else {
            console.log("sessionStorage account_number not found!");
        }
        const body = {
            account_number: accountNumber,
            disbursement_amount: disbursementAmount,
            effective_date: "",
            channel_post_date: "",
            currency_code: "THB",
            service_branch: 0,
            clearing_and_settlement_key: "CBS",
            other_properties: {
                interest_index: "",
                interest_spread: 0,
                first_payment_date: "",
                number_of_payment: String(numberOfPayment),
                installment_amount: String(installmentAmount),
                payment_calculation_method: "installment",
                interest_override_reason: "",
                campaign_name: "",
                interest_schedule: []
            }
        };
        this.setState({ rq_body: body });
    };

    handleChangeModal(event) {
        if (event.target.name === "date") {
            this.setState({ date: event.target.value });
        } else if (event.target.name === "interest_index") {
            this.setState({ interest_index: event.target.value })
        } else if (event.target.name === "interest_spread") {
            this.setState({ interest_spread: event.target.value });
        }
    }

    handleChange(event) {
        //this.setState({[event.target.name]:event.target.value});
        const { rq_body } = { ...this.state };
        const currentState = rq_body;
        const properties = currentState.other_properties;
        if (event.target.name === "interest_index" || event.target.name === "interest_spread"
            || event.target.name === "first_payment_date" || event.target.name === "number_of_payment"
            || event.target.name === "installment_amount" || event.target.name === "interest_override_reason"
            || event.target.name === "campaign_name") {

            properties[event.target.name] = event.target.value;

        } else if (event.target.name === "payment_calculation_method") {
            //check drop down payment_calculation_method field
            properties[event.target.name] = event.target.value;
            if (event.target.value === "minimum") {
                properties["installment_amount"] = "";
                properties["number_of_payment"] = "";
                this.setState({ disabled: "disabled" });
            } else {
                properties["installment_amount"] = String(installmentAmount);
                properties["number_of_payment"] = String(numberOfPayment);
                this.setState({ disabled: "" });
            }
        } else {
            currentState[event.target.name] = event.target.type === "number" ? Number(event.target.value) : event.target.value;
        }
        this.setState({ rq_body: currentState });
    };

    handleSubmit(event) {
        event.preventDefault();
        //convert [] to "" in interest_schedule if interest_schedule === []
        const { rq_body } = { ...this.state };
        const currentState = rq_body;
        const properties = currentState.other_properties;
        properties["interest_schedule"] = "";

        this.setState({ loading: true });
        //clone state for use in omit function.
        let body = cloneDeep(this.state);
        const request = utility.omit(body);
        // console.log(request);
        setTimeout(() => {
            this.setState({ loading: false });
            this.postList(request);
        }, 1000)
    };

    postList = (request) => {
        console.log("myRequest : " + JSON.stringify(request));
        fetch('/api/disbursement', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request),
        }).then(response => response.json())
            .then(data => {

                if (data.rs_body) {
                    utility.clearSessionStorage("response_disbursement");
                    sessionStorage.setItem("response_disbursement", JSON.stringify(data));
                    window.open('/dbmSummary', '_self');
                } else {
                    alert("error code : " + data.errors.map(error => error.error_code) + "\n"
                        + "error desc : " + data.errors.map(error => error.error_desc) + "\n"
                        + "error type : " + data.errors.map(error => error.error_type));
                }
            }).catch(error => console.log(error))

        //mock data
        // let data =  {"rs_body":{"account_number":600000000067,"account_sequence":1,"balance":1000.00}}
        // if (data.rs_body) {
        //         sessionStorage.setItem("response_disbursement",JSON.stringify(data));
        //         window.open('/dbmSummary', '_self');
        // } else {
        //     alert("error code : " + data.errors.map(error => error.error_code) + "\n"
        //     + "error desc : " + data.errors.map(error => error.error_desc) + "\n"
        //     + "error type : " + data.errors.map(error => error.error_type));
        // }
    };

    handleOpenModal() {
        this.setState({ openMyModal: true });
    }

    closeModal() {
        this.setState({ openMyModal: false });
    }

    handleCloseModal = (e) => {
        e.preventDefault();
        this.setState({ openMyModal: false });
        this.setState({ isFound: true });
        let data = {
            date: this.state.date,
            interest_index: this.state.interest_index,
            interest_spread: this.state.interest_spread
        };

        dataArray.push(data);
        const { rq_body } = { ...this.state };
        const currentState = rq_body;
        const properties = currentState.other_properties;
        properties["interest_schedule"] = dataArray;
        // console.log("dataArray : "+ JSON.stringify(dataArray))
        // console.log(this.state.rq_body);
    }

    FormInputData = () => {
        return inputModel.model.map(item => {
            if (item.root === null) {
                return (
                    <FormGroup>
                        <Label>{item.label}</Label>
                        <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                            value={this.state.rq_body[item.value]} onChange={this.handleChange} />
                    </FormGroup>
                );
            } else {
                if (item.type === "select") {
                    return (
                        <FormGroup>
                            <Label>{item.label}</Label>
                            <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                                value={this.state.rq_body[item.root][item.value]} onChange={this.handleChange}>
                                {item.items.map(element => <option>{element}</option>)}
                            </Input>
                        </FormGroup>
                    )
                } else {
                    if (item.name === "installment_amount" || item.name === "number_of_payment") {
                        return (
                            <FormGroup>
                                <Label>{item.label}</Label>
                                <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                                    value={this.state.rq_body[item.root][item.value]}
                                    onChange={this.handleChange} disabled={this.state.disabled} />
                            </FormGroup>
                        )
                    } else {
                        return (
                            <FormGroup>
                                <Label>{item.label}</Label>
                                <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                                    value={this.state.rq_body[item.root][item.value]} onChange={this.handleChange} />
                            </FormGroup>
                        )
                    }
                }
            }
        })
    };

    // FormInputData = () => {


    // }

    callDelete(param1, e) {
        e.preventDefault();
        // console.log(param1);

        // if(this.state.rq_body.other_properties.interest_schedule.length === 0){
        //     this.setState({isFound : false});
        // }else{
        //     const { rq_body } = { ...this.state };
        //     const properties = rq_body.other_properties;
        //     properties["interest_schedule"] = this.state.rq_body.other_properties.interest_schedule.splice(param1, 1);
        //     // dataArray = this.state.rq_body.other_properties.interest_schedule.splice(param1, 1);
        //     // console.log("dataArray : "+JSON.stringify(dataArray));
        //     // properties["interest_schedule"] = dataArray;
        //     console.log(this.state.rq_body.other_properties.interest_schedule.splice(param1, 1));
        //     // console.log("state : "+ JSON.stringify(this.state.rq_body.other_properties.interest_schedule));
        // }
        // this.setState({isFound : false});
        // this.setState({isFound : true});
     
    }

    render() {
        const { loading } = this.state;
        let tempData = this.state.rq_body.other_properties.interest_schedule;
        return (
            <div>
                <DynamicHeader />
                <h2>Form Input Disbursement</h2>
                <Container>
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col md={{ size: 4, offset: 4 }}>
                                {this.FormInputData()}
                                <FormGroup>
                                    <Label>Interest Schedule</Label>
                                    <div>
                                        <Button color="secondary" type="button" onClick={this.handleOpenModal}>Add
                                            Interest Schedule</Button>
                                        <Modal isOpen={this.state.openMyModal}>
                                            <ModalHeader toggle={this.closeModal} >Interest Schedule</ModalHeader>
                                            <ModalBody>
                                                <FormGroup>
                                                    <Label>Date</Label>
                                                    <Input type="date" name="date" placeholder="date" step="any"
                                                        value={this.state.date} onChange={this.handleChangeModal}>
                                                    </Input>
                                                    <Label>Interest Index</Label>
                                                    <Input type="String" name="interest_index" placeholder="interest_index"
                                                        step="any"
                                                        value={this.state.interest_index}
                                                        onChange={this.handleChangeModal}>
                                                    </Input>
                                                    <Label>Interest Spread</Label>
                                                    <Input type="number" name="interest_spread"
                                                        placeholder="interest_spread" step="any"
                                                        value={this.state.interest_spread}
                                                        onChange={this.handleChangeModal}>
                                                    </Input>
                                                    <div class="text-center">
                                                    <Button color="primary" onClick={(e) => this.handleCloseModal(e)}>Add</Button>{' '}
                                                    <Button color="secondary" onClick={this.closeModal}>close</Button>
                                                    </div>
                                                </FormGroup>
                                            </ModalBody>
                                        </Modal>
                                    </div>
                                </FormGroup>
                            </Col>
                        </Row>
                        {this.state.isFound &&
                            <div>
                                <Table striped>
                                    <tbody>
                                    <tr>
                                        <th>No.</th>
                                        <th>Date</th>
                                        <th>Interest Index</th>
                                        <th>Interest Spread</th>
                                        <th></th>
                                    </tr>
                                {tempData.map((item, index) => {
                                    return (
                                                <tr>
                                                    <td>{index}</td>
                                                    <td>{item.date}</td>
                                                    <td>{item.interest_index}</td>
                                                    <td>{item.interest_spread}</td>
                                                    <td>
                                                    <Button onClick={(e) => this.callDelete(index, e)} type="button" color="danger">DEL</Button>
                                                    </td>
                                                </tr>
                                    )
                                }
                                )}
                                    </tbody>
                                </Table>
                            </div>
                        }
                        <div class="text-center">
                            <Button color="primary" type="submit" disabled={loading}>
                                {loading && (<SpinnerLoader />)}
                                {loading && <span>Loading..</span>}
                                {!loading && <span>Submit</span>}
                            </Button>
                        </div>
                    </Form>
                    <Row>
                        <Col md={{ size: 4, offset: 4 }}>

                        </Col>
                    </Row>
                </Container>
            </div>
        )
    };
}

export default disbursementComponent;
