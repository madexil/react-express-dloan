import React, { Component } from 'react';
import DynamicHeader from '../Header.js';
import SpinnerLoader from '../loading.js';
import '../form.css';
import utility from '../Utility.js';

import {
    Button,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    FormGroup,
    Input,
    Label,
    Row,
    UncontrolledDropdown
} from 'reactstrap';

import v000 from './v000.json';
import v001 from './v001.json';
import v002 from './v002.json';
import v003 from './v003.json';
import v004 from './v004.json';
import v005 from './v005.json';
import inputModel from './model.json';

const cloneDeep = require('lodash.clonedeep');

class OpenLoanAccountComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rq_body: {
                customer_number: "",
                customer_type: "",
                account_name: "",
                credit_limit: 0,
                credit_term_number: 0,
                credit_term_unit: "",
                product_name: "",
                disbursement_account: "",
                deduction_account: "",
                account_branch: 0,
                response_unit: 0,
                application_id: "",
                interest: {
                    interest_index: "",
                    interest_spread: 0
                },
                payment: {
                    payment_frequency: 0,
                    payment_unit: "",
                    payment_date: 0,
                    payment_calculation_method: ""
                }
            },
            loading: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadJson = this.loadJson.bind(this);
    };

    handleChange(event) {
        //this.setState({[event.target.name]:event.target.value});
        const { rq_body } = { ...this.state };
        const currentState = rq_body;
        const interest = currentState.interest;
        const payment = currentState.payment;

        if (event.target.name === "interest_index" || event.target.name === "interest_spread") {
            interest[event.target.name] = event.target.type === "number" ? Number(event.target.value) : event.target.value;
        } else if (event.target.name === "payment_frequency" || event.target.name === "payment_unit" ||
            event.target.name === "payment_date" || event.target.name === "billing_offset_day"
            || event.target.name === "payment_calculation_method") {

            payment[event.target.name] = event.target.type === "number" ? Number(event.target.value) : event.target.value;
        } else {
            currentState[event.target.name] = event.target.type === "number" ? Number(event.target.value) : event.target.value;
        }
        this.setState({ rq_body: currentState });

    };

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ loading: true });
        //clone state for use in omit function.
        let body = cloneDeep(this.state);
        const request = utility.omit(body);
        console.log(request);
        setTimeout(() => {
            this.setState({ loading: false });
            this.postList(request);
        }, 1000);
    };

    loadJson(event) {
        if (event.target.name === "000") {
            this.setState(v000);
        }
        if (event.target.name === "001") {
            this.setState(v001);
        }
        if (event.target.name === "002") {
            this.setState(v002);
        }
        if (event.target.name === "003") {
            this.setState(v003);
        }
        if (event.target.name === "004") {
            this.setState(v004);
        }
        if (event.target.name === "005") {
            this.setState(v005);
        }
    };

    postList = (request) => {
        console.log("myRequest : " + JSON.stringify(request));
        fetch('/api/openLoanAccount', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        })
            .then(response => response.json())
            .then(data => {
                if (data.rs_body) {
                    utility.clearSessionStorage("response_openLoanAccount");
                    sessionStorage.setItem("response_openLoanAccount", JSON.stringify(data));
                    window.open('/olaSummary', '_self');
                } else {
                    alert("error code : " + data.errors.map(error => error.error_code) + "\n"
                        + "error desc : " + data.errors.map(error => error.error_desc));
                }
            }).catch(error => console.log(error))

        //mock data
        // let data = {
        //   "rs_body": {
        //     "account_number": "111111111555",
        //     "open_date": "2019-08-27"
        //   }
        // }
        // if (data.rs_body) {
        //     sessionStorage.setItem("response_openLoanAccount", JSON.stringify(data));
        //     window.open('/olaSummary', '_self');
        // } else {
        //   alert("error code : " + data.errors.map(error => error.error_code) + "\n"
        //     + "error desc : " + data.errors.map(error => error.error_desc));
        // }
    };

    FormInputRow1 = () => {
        let count = 0;
        //edit to colLeft and colRight
        let strCol1 = [];
        let strCol2 = [];
        inputModel.model.map(item => {
            count++;
            if (item.root === null) {
                if (count % 2 != 0) {
                    strCol1.push(<FormGroup>
                        <Label>{item.label}</Label>
                        <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                            value={this.state.rq_body[item.value]} onChange={this.handleChange} />
                    </FormGroup>
                    )
                } else {
                    strCol2.push(<FormGroup>
                        <Label>{item.label}</Label>
                        <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                            value={this.state.rq_body[item.value]} onChange={this.handleChange} />
                    </FormGroup>
                    )
                }
            }
        });
        return (<Row><Col md={{ size: 3, offset: 3 }}>{strCol1}</Col><Col md={{ size: 3 }}>{strCol2}</Col></Row>);
    };

    FormInputRow2 = () => {
        let count = 0;
        //edit to colLeft and colRight
        let Col1 = [];
        let Col2 = [];
        inputModel.model.map(item => {
            count++;
            if (item.root != null && item.root === "interest") {
                if (count % 2 != 0) {
                    Col1.push(<FormGroup>
                        <Label>{item.label}</Label>
                        <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                            value={this.state.rq_body[item.value]} onChange={this.handleChange} />
                    </FormGroup>
                    )
                } else {
                    Col2.push(<FormGroup>
                        <Label>{item.label}</Label>
                        <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                            value={this.state.rq_body[item.value]} onChange={this.handleChange} />
                    </FormGroup>
                    )
                }
            }
        });
        return (<Row><Col md={{ size: 3, offset: 3 }}>{Col1}</Col><Col md={{ size: 3 }}>{Col2}</Col></Row>);
    }

    FormInputRow3 = () => {
        let count = 0;
        //edit to colLeft and colRight
        let Col1 = [];
        let Col2 = [];
        inputModel.model.map(item => {
            count++;
            if (item.root != null && item.root === "payment") {
                if (count % 2 != 0) {
                    Col1.push(<FormGroup>
                        <Label>{item.label}</Label>
                        <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                            value={this.state.rq_body[item.value]} onChange={this.handleChange} />
                    </FormGroup>
                    )
                } else {
                    if (item.type === "select") {
                        Col2.push(
                            <FormGroup>
                                <Label>{item.label}</Label>
                                <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                                    value={this.state.rq_body[item.root][item.value]} onChange={this.handleChange} >
                                    {item.items.map(element => <option>{element}</option>)}
                                </Input>
                            </FormGroup>
                        );
                    } else {
                        Col2.push(<FormGroup>
                            <Label>{item.label}</Label>
                            <Input type={item.type} name={item.name} placeholder={item.placeholder} step="any"
                                value={this.state.rq_body[item.value]} onChange={this.handleChange} />
                        </FormGroup>
                        );
                    }
                }
            }
        });
        return (<Row><Col md={{ size: 3, offset: 3 }}>{Col1}</Col><Col md={{ size: 3 }}>{Col2}</Col></Row>);
    }

    render() {
        const { loading } = this.state;
        return (
            <div>
                <DynamicHeader />
                <Container>
                    <h2>Form Input Open Account</h2>
                    <UncontrolledDropdown align="center">
                        <DropdownToggle caret color="secondary">Select validation here &nbsp;</DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem name="000" onClick={this.loadJson}>Select validation here</DropdownItem>
                            <DropdownItem name="001" onClick={this.loadJson}>Input body Open Account Validation
                                001</DropdownItem>
                            <DropdownItem name="002" onClick={this.loadJson}>Input body Open Account Validation
                                002</DropdownItem>
                            <DropdownItem name="003" onClick={this.loadJson}>Input body Open Account Validation
                                003</DropdownItem>
                            <DropdownItem name="004" onClick={this.loadJson}>[DEMO1]Input body Open Account Validation
                                004</DropdownItem>
                            <DropdownItem name="005" onClick={this.loadJson}>[DEMO2]Input body Open Account Validation
                                005</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                    <Form onSubmit={this.handleSubmit}>

                        {this.FormInputRow1()}
                        <h4>Interest</h4>
                        <hr width="70%" />
                        {this.FormInputRow2()}
                        <h4>Payment</h4>
                        <hr width="70%" />
                        {this.FormInputRow3()}

                        <div class="text-center">
                            <Button color="primary" type="submit" disabled={loading}>
                                {/* Submit */}
                                {loading && (<SpinnerLoader />)}
                                {loading && <span>Loading..</span>}
                                {!loading && <span>Submit</span>}
                            </Button>
                            {/* < SpinnerLoader /> */}
                        </div>
                    </Form>
                </Container>
            </div>
        );
    };
}

export default OpenLoanAccountComponent;
