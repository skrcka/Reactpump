import React from 'react'
import './App.css';
import { Input, Progress, Button, Label, Form, FormGroup, Container, Row, Col } from 'reactstrap'
import ReactInterval from 'react-interval';
import axios from 'axios';

import Toggle from './Toggle'
import Integernumpad from './Integernumpad'

let API_URL = 'HTTP://10.0.28.171:5000'; // 'HTTP://10.0.28.171:5000' 'HTTP://127.0.0.1:5000';

class App extends React.Component {
    state = {
        running: false,
        mode: 0, // 1 default, 2 asap
        ml: 0,
        volume_unit: 0,
        time_rate: 0,
        time_rate_unit: 0,
        pull: false,
        progress: 0,
        steps_per_ml: 0,
        syringe_size: 0,
        steps: 0,
        screen_lock: false,
        ip: "",
        pause: false,
    };

    componentWillUpdate = (nextProps, nextState) => {
        if(nextState.mode !== this.state.mode){
            nextState.ml = 0;
            nextState.time_rate = 0;
        }
        if(nextState.running !== this.state.running){
            nextState.volume_unit = 0;
            nextState.time_rate_unit = 0;
        }
    }

    fetchData(){
        axios.get(`${API_URL}/status`).then( result => {
            this.setState({
                running: result.data.running,
                mode: result.data.mode,
                ml: result.data.ml,
                time_rate: result.data.time_rate,
                progress: result.data.progress,
                steps_per_ml: result.data.steps_per_ml,
                syringe_size: result.data.syringe_size,
                screen_lock: result.data.screen_lock,
                ip: result.data.ip,
                pause: result.data.pause,
            });
        });
    }

    componentDidMount = () => {
        let link = window.location.href.split(':');
        API_URL = `${link[0]}:${link[1]}:5000`;
        console.log(API_URL)
        this.fetchData();
    };

    checkForUpdates = async () => {
        const result = await axios.get(`${API_URL}/status`);
        if(result.data.running){
            if(!this.state.running)
                this.setState({
                    running: result.data.running,
                });
            this.setState({
                ml: result.data.ml,
                time_rate: result.data.time_rate,
                progress: result.data.progress,
                mode: result.data.mode,
                pause: result.data.pause,
            });
        }
        else {
            if(this.state.running)
                this.setState({
                    ml: result.data.ml,
                    time_rate: result.data.time_rate,
                    running: result.data.running,
                    mode: result.data.mode,
                    pause: result.data.pause,
                });
        }
    }

    sendDataToBackend = async () => {
        await axios.post(`${API_URL}/update_status`,
            [
                this.state.mode,
                this.state.pull,
                this.state.ml,
                this.state.volume_unit,
                this.state.time_rate,
                this.state.time_rate_unit,
            ]
        );
        this.fetchData();
    };

    sendManualStepsToBackend = async () => {
        await axios.post(`${API_URL}/manual_move`,
            [
                this.state.mode,
                this.state.pull,
                this.state.steps,
            ]
        );
        this.fetchData();
    };

    sendConfigToBackend = async () => {
        await axios.post(`${API_URL}/update_config`,
            [
                this.state.steps_per_ml,
                this.state.syringe_size,
            ]
        );
        this.fetchData();
    };

    stopBackend = async () => {
        await axios.get(`${API_URL}/stop`)
    };

    pauseBackend = async () => {
        await axios.get(`${API_URL}/pause`)
    };

    render() {
        const {
            running,
            mode,
            ml,
            volume_unit,
            time_rate,
            time_rate_unit,
            pull,
            progress,
            steps_per_ml,
            syringe_size,
            steps,
            screen_lock,
            ip,
            pause,
        } = this.state

        return (
            <div className="App">
                {/*<ReactInterval timeout={100} enabled={true} callback={this.checkForUpdates} />*/}
                <div className='main m-1 p-1'>
                    <Row className="header">
                        <Col xs='3'>
                            <Button className='backbutton mt-1' disabled={mode === 0 || running} color="danger" onClick={() => {this.setState({ mode: 0} );}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 150 471.2 471.2">
                                    <path d="M344.6,222.1H159.2l47.4-47.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0L117,226c-5.3,5.3-5.3,13.8,0,19.1l70.6,70.5
                                        c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L159.1,249h185.5c7.5,0,13.5-6,13.5-13.5S352.1,222.1,344.6,222.1z"/>
                                </svg>
                            </Button>
                        </Col>
                        <Col>
                            <h2 className='appname'>Pump controller</h2>
                        </Col>
                    </Row>
                    <div className='content  text-left'>
                        {running &&
                            <div className='maincontent'>
                                <Row>
                                    <Col className='text-left'>
                                        <Label className='text-left' for="progress">Running...</Label>
                                    </Col>
                                    { mode === 1 &&
                                        <Col className='text-right'>
                                            <p>timeleft: {time_rate.toFixed(1)}</p>
                                        </Col>
                                    }
                                </Row>
                                <Progress name='progress' animated color="primary" value={progress} />
                            </div>
                        }
                        {!running &&
                            <div className='maincontent'>
                                {mode === 0 &&
                                    <div className='menubuttons'>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 1} );}}>Volume/Time mode</Button></div>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 2} );}}>ASAP mode</Button></div>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 3} );}}>Rate mode</Button></div>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 4} );}}>Settings</Button></div>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 5} );}}>About</Button></div>
                                    </div>
                                }
                                {mode === 1 &&
                                    <Form>
                                        <div className='form  text-left'>
                                            <div>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Label className="mt-1">How much?</Label>
                                                    </Col>
                                                    <Col xs="4">
                                                        <Input type="select" onChange={ (event) => { this.setState({ volume_unit: parseInt(event.target.value) }); } }>
                                                            <option value="0">ml</option>
                                                            <option value="1">μl</option>
                                                            <option value="2">nl</option>
                                                        </Input>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Integernumpad value={ml} fn={(value) => { this.setState({ml: parseFloat(value)}); }} decimal={4} />
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div>
                                                <Row>
                                                    <Col>
                                                        <Label>In how long? (sec)</Label>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Integernumpad value={time_rate} fn={(value) => { this.setState({time_rate: parseFloat(value)}); }} decimal={2} />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    </Form>
                                }

                                {mode === 2 &&
                                    <Form>
                                        <div className='form  text-left'>
                                            <div>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Label className="mt-1">How much?</Label>
                                                    </Col>
                                                    <Col xs="4">
                                                        <Input type="select" onChange={ (event) => { this.setState({ volume_unit: parseInt(event.target.value) }); } }>
                                                            <option value="0">ml</option>
                                                            <option value="1">μl</option>
                                                            <option value="2">nl</option>
                                                        </Input>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Integernumpad value={ml} fn={(value) => { this.setState({ml: parseFloat(value)}); }} decimal={4} />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    </Form>
                                }

                                {mode === 3 &&
                                    <Form>
                                        <div className='form  text-left'>
                                            <div>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Label className="mt-1">How much?</Label>
                                                    </Col>
                                                    <Col xs="4">
                                                        <Input type="select" onChange={ (event) => { this.setState({ volume_unit: parseInt(event.target.value) }); } }>
                                                            <option value="0">ml</option>
                                                            <option value="1">μl</option>
                                                            <option value="2">nl</option>
                                                        </Input>
                                                    </Col>
                                                </Row>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Integernumpad value={ml} fn={(value) => { this.setState({ml: parseFloat(value)}); }} decimal={4} />
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Label className="mt-1">At what rate?</Label>
                                                    </Col>
                                                    <Col xs="4">
                                                        <Input type="select" onChange={ (event) => { this.setState({ time_rate_unit: parseInt(event.target.value) }); } }>
                                                            <option value="0">ml/s</option>
                                                            <option value="1">μl/s</option>
                                                            <option value="2">nl/s</option>
                                                        </Input>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Integernumpad value={time_rate} fn={(value) => { this.setState({time_rate: parseFloat(value)}); }} decimal={2} />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    </Form>
                                }

                                {mode === 4 &&
                                    <Form>
                                        <div className='form  text-left'>
                                            <div>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Label className="mt-1">Ml / 10000 steps</Label>
                                                    </Col>
                                                    <Col xs="6" className="text-right">
                                                        <Button color="primary" className='calibratebutton mt-1 text-center' onClick={() => {
                                                            this.setState({ 
                                                                mode: 4,
                                                                pull: false,
                                                                steps: 10000,
                                                            }, this.sendManualStepsToBackend);
                                                        }}>Make 10 000 steps</Button>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Integernumpad value={10000.0 / steps_per_ml} fn={(value) => { this.setState({steps_per_ml: parseInt(10000 / parseFloat(value))}); }} decimal={0} />
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Label className="mt-1">Syringe size</Label>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Integernumpad value={syringe_size} fn={(value) => { this.setState({syringe_size: parseFloat(value)}); }} decimal={2} />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    </Form>
                                }
                                {mode === 5 &&
                                    <Form>
                                        <div className='form  text-left'>
                                            <div>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Label for="ip" className="mt-1">IP</Label>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Input name="ip" value={ip} disabled />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    </Form>
                                }
                            </div>
                        }
                    </div>
                    {mode !== 0 &&
                        <div className='footer ml-1 mb-1'>
                            <Row>
                                <Col xs="3" className='text-left'>
                                    {!running &&
                                        <Button className='backbutton footerbtn' disabled={mode === 0 || running} color="danger" onClick={() => {this.setState({ mode: 0} );}}>
                                            <svg className='innerfooterbackbutton' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350">
                                                <path d="M344.6,222.1H159.2l47.4-47.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0L117,226c-5.3,5.3-5.3,13.8,0,19.1l70.6,70.5
                                                    c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L159.1,249h185.5c7.5,0,13.5-6,13.5-13.5S352.1,222.1,344.6,222.1z"/>
                                            </svg>
                                        </Button>
                                    }
                                </Col>
                                <Col className='text-center'>
                                    {running && !pause && 
                                        <div className='footerbtn'>
                                            <Button className='mt-3' color="warning" onClick={this.pauseBackend}>PAUSE</Button>
                                        </div>
                                    }
                                    {running && pause && 
                                        <div className='footerbtn'>
                                            <Button className='mt-3' color="warning" onClick={this.pauseBackend}>RESUME</Button>
                                        </div>
                                    }
                                    {!running && [1,2,3].includes(mode) &&
                                        <div className='footerswitch'>
                                            <Toggle className='footerswitch' value={pull} fn={ () => { this.setState({ pull: !pull }); } } />
                                        </div>
                                    }
                                </Col>
                                <Col className="text-center" xs="3">
                                    {running && 
                                        <div className='footerbtn'>
                                            <Button className='mt-3' color="danger" onClick={this.stopBackend}>STOP</Button>
                                        </div>
                                    }
                                    {!running &&
                                        <div>
                                            {[1,2,3].includes(mode) &&
                                                <Button className='mr-1 footerbtn' color="success" onClick={this.sendDataToBackend}><span className='innerfooterbutton'>START</span></Button>
                                            }
                                            {mode === 4 &&
                                                <Button className='mr-2 footerbtn' color="success" onClick={this.sendConfigToBackend}><span className='innerfooterbutton'>SAVE</span></Button>
                                            }
                                        </div>
                                    }
                                </Col>
                            </Row>
                        </div>
                    }  
                </div>
            </div>
        );
    };
}

export default App;