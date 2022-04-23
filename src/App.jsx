import React from 'react'
import './App.css';
import { Input, Progress, Button, Label, Form, FormGroup, Container, Row, Col } from 'reactstrap'
import ReactInterval from 'react-interval';
import axios from 'axios';
import QRCode from "react-qr-code";

import Toggle from './Toggle'
import Integernumpad from './Integernumpad'

let API_URL = 'HTTP://10.0.28.171:5000'; // 'HTTP://10.0.28.171:5000' 'HTTP://127.0.0.1:5000';

class App extends React.Component {
    state = {
        running: true,
        mode: 1, // 1 default, 2 asap
        ml: 0,
        ml_in_pump: 0,
        total_ml: 0,
        volume_unit: 0,
        time_rate: 0,
        time_rate_unit: 0,
        pull: false,
        progress: 0,
        steps_per_ml: 0,
        syringe_size: 0,
        steps: 0,
        screen_lock: 0,
        ip: "",
        pause: false,
        bolus_dose: 0,
        active_bolus_dose: 0,
        bolus_cooldown: 0,
        active_bolus_cooldown: 0,
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
                ml_in_pump: result.data.ml_in_pump,
                time_rate: result.data.time_rate,
                progress: result.data.progress,
                steps_per_ml: result.data.steps_per_ml,
                syringe_size: result.data.syringe_size,
                ip: result.data.ip,
                pause: result.data.pause,
                bolus_dose: result.data.bolus_dose,
                active_bolus_dose: result.data.active_bolus_dose,
                bolus_cooldown: result.data.bolus_cooldown,
                active_bolus_cooldown: result.data.active_bolus_cooldown,
            });
        });
    }

    componentDidMount = () => {
        let link = window.location.href.split(':');
        API_URL = `${link[0]}:${link[1]}:5000`;
        console.log(API_URL)
        //this.fetchData();
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
                ml_in_pump: result.data.ml_in_pump,
                time_rate: result.data.time_rate,
                progress: result.data.progress,
                mode: result.data.mode,
                pause: result.data.pause,
                bolus_dose: result.data.bolus_dose,
                active_bolus_dose: result.data.active_bolus_dose,
                bolus_cooldown: result.data.bolus_cooldown,
                active_bolus_cooldown: result.data.active_bolus_cooldown,
            });
        }
        else {
            if(this.state.running)
                this.setState({
                    ml: result.data.ml,
                    ml_in_pump: result.data.ml_in_pump,
                    time_rate: result.data.time_rate,
                    running: result.data.running,
                    mode: result.data.mode,
                    pause: result.data.pause,
                    bolus_dose: result.data.bolus_dose,
                    active_bolus_dose: result.data.active_bolus_dose,
                    bolus_cooldown: result.data.bolus_cooldown,
                    active_bolus_cooldown: result.data.active_bolus_cooldown,
                });
        }
    }

    sendDataToBackend = async () => {
        this.setState({total_ml: this.ml});
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
        this.setState({total_ml: this.state.steps_per_ml / this.state.steps});
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
                this.state.ml_in_pump,
                this.state.bolus_dose,
                this.state.bolus_cooldown,
            ]
        );
        this.fetchData();
    };

    stopBackend = async () => {
        await axios.get(`${API_URL}/stop`);
    };

    pauseBackend = async () => {
        await axios.get(`${API_URL}/pause`);
    };

    sendBolus = async () => {
        await axios.get(`${API_URL}/bolus`);
    };

    render() {
        const {
            running,
            mode,
            ml,
            ml_in_pump,
            total_ml,
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
            bolus_dose,
            active_bolus_dose,
            bolus_cooldown,
            active_bolus_cooldown,
        } = this.state

        return (
            <div className="App">
                {/*<ReactInterval timeout={100} enabled={true} callback={this.checkForUpdates} />*/}
                <div className='main m-1 p-1'>
                    <div className="header mb-1">
                        <div className='maxheightlimit'>
                            <div className='text-left statusbar maxheightlimit'>
                                <Col>
                                    <p className={running ? 'textDanger' : 'textSuccess'}>{ml_in_pump.toFixed(3)} ml {running ? (pull ? '↓' : '↑') : ''}</p>
                                </Col>
                                <Col className='text-right'>
                                    {ip &&
                                        <p>IP: {ip}</p>
                                    }
                                </Col>
                            </div>
                        </div>
                    </div>
                    <div className='content text-left'>
                        {running && mode !== 4 &&
                            <div>
                                {screen_lock > 0 &&
                                    <div className='mymodal'>
                                        <Button color="warning" className='lockbutton' onClick={() => { this.setState({screen_lock: screen_lock-1}); }}>
                                            <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="100px" height="100px">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9069372 8 4 8.9069372 4 10 L 4 20 C 4 21.093063 4.9069372 22 6 22 L 18 22 C 19.093063 22 20 21.093063 20 20 L 20 10 C 20 8.9069372 19.093063 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 6 10 L 18 10 L 18 20 L 6 20 L 6 10 z M 12 13 C 10.9 13 10 13.9 10 15 C 10 16.1 10.9 17 12 17 C 13.1 17 14 16.1 14 15 C 14 13.9 13.1 13 12 13 z"/>
                                            </svg>
                                        </Button>
                                        <span>Click 3 times to unlock!</span>
                                    </div>
                                }
                                <div className='maincontent'>
                                    <div className='form'>
                                        <Row>
                                            <Col className='text-left'>
                                                <Label className='text-left' for="progress">Running...</Label>
                                            </Col>
                                            { mode === 1 &&
                                                <Col className='text-right'>
                                                    <Label>timeleft: {time_rate.toFixed(1)}</Label>
                                                </Col>
                                            }
                                            { mode === 3 &&
                                                <Col className='text-right'>
                                                    <Label>timeleft: {(ml / time_rate).toFixed(1)}</Label>
                                                </Col>
                                            }
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Progress name='progress' animated color="primary" value={progress} />
                                            </Col>
                                            <Col sm="3" className='text-right'>
                                                <Input disabled className='smallinput progressinput' name='progress' animated value={`${progress}%`} />
                                            </Col>
                                        </Row>
                                        <Row className="mb-1">
                                            <Col>
                                                <Label className="mt-1">Total amount</Label>
                                            </Col>
                                            <Col>
                                                <Label className="mt-1">Left to push</Label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Input disabled value={total_ml.toFixed(2)} />
                                            </Col>
                                            <Col>
                                                <Input disabled value={ml.toFixed(2)} />
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        }
                        {(!running || mode === 4) &&
                            <div className='maincontent'>
                                {mode === 0 &&
                                    <div className='menubuttons'>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 1} );}}>Volume/Time mode</Button></div>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 2} );}}>ASAP mode</Button></div>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 3} );}}>Rate mode</Button></div>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 4} );}}>Settings</Button></div>
                                        <div className='menubutton mt-1'><Button className='w-100 text-left' onClick={() => {this.setState({ mode: 5} );}}>Remote control</Button></div>
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
                                                        <Integernumpad value={ml.toFixed(4)} fn={(value) => { this.setState({ml: parseFloat(value)}); }} decimal={4} />
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div>
                                                <Row className='mb-1 mt-1'>
                                                    <Col>
                                                        <Label>In how long?</Label>
                                                    </Col>
                                                    <Col xs="4">
                                                        <Input type="select" onChange={ (event) => { this.setState({ time_rate_unit: parseInt(event.target.value) }); } }>
                                                            <option value="0">s</option>
                                                            <option value="1">min</option>
                                                        </Input>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Integernumpad value={time_rate.toFixed(2)} fn={(value) => { this.setState({time_rate: parseFloat(value)}); }} decimal={2} />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    </Form>
                                }

                                {mode === 2 &&
                                    <Form>
                                        <div className='form text-left'>
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
                                                        <Integernumpad value={ml.toFixed(4)} fn={(value) => { this.setState({ml: parseFloat(value)}); }} decimal={4} />
                                                    </Col>
                                                </Row>

                                                <Row className="mt-3">
                                                    <Col>
                                                        <Label className="mt-1">Move manually</Label>
                                                    </Col>
                                                </Row>
                                                <Row className='ml-0 mr-0 pl-0 pr-0'>
                                                    <Col xs="2" className='pl-0 pr-1 ml-0 mr-0'>
                                                        <Button color="warning" className='calibratebutton mt-1 text-center w-100 p-0 m-0' onClick={() => {
                                                                this.setState({ 
                                                                    mode: 5,
                                                                    pull: true,
                                                                    steps: 1000,
                                                                }, this.sendManualStepsToBackend);
                                                            }}>{"<<<"}</Button>
                                                    </Col>
                                                    <Col xs="2" className='pr-1 pl-1 ml-0 mr-0'>
                                                        <Button color="warning" className='calibratebutton mt-1 text-center w-100 p-0 m-0' onClick={() => {
                                                                this.setState({ 
                                                                    mode: 5,
                                                                    pull: true,
                                                                    steps: 100,
                                                                }, this.sendManualStepsToBackend);
                                                            }}>{"<<"}</Button>
                                                    </Col>
                                                    <Col xs="2" className='pl-1 pr-1 ml-0 mr-0'>
                                                        <Button color="warning" className='calibratebutton mt-1 text-center w-100 p-0 m-0' onClick={() => {
                                                                this.setState({ 
                                                                    mode: 5,
                                                                    pull: true,
                                                                    steps: 10,
                                                                }, this.sendManualStepsToBackend);
                                                            }}>{"<"}</Button>
                                                    </Col>
                                                    <Col xs="2" className='pl-1 pr-1 ml-0 mr-0'>
                                                        <Button color="warning" className='calibratebutton mt-1 text-center w-100 p-0 m-0' onClick={() => {
                                                                this.setState({ 
                                                                    mode: 5,
                                                                    pull: false,
                                                                    steps: 10,
                                                                }, this.sendManualStepsToBackend);
                                                            }}>{">"}</Button>
                                                    </Col>
                                                    <Col xs="2" className='pr-1 pl-1 ml-0 mr-0'>
                                                        <Button color="warning" className='calibratebutton mt-1 text-center w-100 p-0 m-0' onClick={() => {
                                                                this.setState({ 
                                                                    mode: 5,
                                                                    pull: false,
                                                                    steps: 100,
                                                                }, this.sendManualStepsToBackend);
                                                            }}>{">>"}</Button>
                                                    </Col>
                                                    <Col xs="2" className='pl-1 pr-0 ml-0 mr-0'>
                                                        <Button color="warning" className='calibratebutton mt-1 text-center w-100 p-0 m-0' onClick={() => {
                                                                this.setState({ 
                                                                    mode: 5,
                                                                    pull: false,
                                                                    steps: 1000,
                                                                }, this.sendManualStepsToBackend);
                                                            }}>{">>>"}</Button>
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
                                                        <Integernumpad value={ml.toFixed(4)} fn={(value) => { this.setState({ml: parseFloat(value)}); }} decimal={4} />
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
                                                        <Integernumpad value={time_rate.toFixed(3)} fn={(value) => { this.setState({time_rate: parseFloat(value)}); }} decimal={3} />
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
                                                        <Button disabled={running} color="primary" className='calibratebutton mt-1 text-center' onClick={() => {
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
                                                        <Integernumpad value={(10000.0 / steps_per_ml).toFixed(3)} fn={(value) => { this.setState({steps_per_ml: parseInt(10000 / parseFloat(value))}); }} decimal={3} />
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div>
                                                <Row className="mb-1">
                                                    <Col>
                                                        <Label className="mt-1">Syringe size</Label>
                                                    </Col>
                                                    <Col>
                                                        <Label className="mt-1">Currently in syringe</Label>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Integernumpad value={syringe_size.toFixed(3)} fn={(value) => { this.setState({syringe_size: parseFloat(value)}); }} decimal={3} />
                                                    </Col>
                                                    <Col>
                                                        <Integernumpad value={ml_in_pump.toFixed(3)} fn={(value) => { this.setState({ml_in_pump: parseFloat(value)}); }} decimal={3} />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    </Form>
                                }
                                {mode === 5 &&
                                    <Form>
                                        <div className='text-center'>
                                            <div>
                                                <QRCode size="170" value={`http://${ip}:3000`} />
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
                                    {running  && mode !==4 &&
                                        <div className='footerbtn'>
                                            <Button className='pr-1 footerbtn' color="warning" onClick={() => {this.setState({screen_lock: 3});}}><span className='innerfooterbutton'>LOCK</span></Button>
                                        </div>
                                    }
                                    {(!running || mode === 4) &&
                                        <Button className='m-0 pr-1 footerbtn' disabled={mode === 0 || running} color="danger" onClick={() => {this.setState({ mode: 0} );}}>
                                            <svg className='innerfooterbutton' xmlns="http://www.w3.org/2000/svg" viewBox="0 90 500 350">
                                                <path d="M344.6,222.1H159.2l47.4-47.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0L117,226c-5.3,5.3-5.3,13.8,0,19.1l70.6,70.5
                                                    c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L159.1,249h185.5c7.5,0,13.5-6,13.5-13.5S352.1,222.1,344.6,222.1z"/>
                                            </svg>
                                        </Button>
                                    }
                                </Col>
                                <Col xs="3" className='text-center'>
                                    {running && !pause && [1,3].includes(mode) && 
                                        <Button disabled={active_bolus_cooldown} className='mr-2 pr-1 footerbtn' color="success" onClick={this.sendBolus}><span className='innerfooterbutton'>{active_bolus_cooldown ? active_bolus_cooldown.toFixed(0) : "BOLUS"}</span></Button>
                                    }
                                </Col>
                                <Col xs="3" className='text-center'>
                                    {running && !pause && mode !==4 && 
                                        <Button className='mr-2 pr-1 footerbtn' color="warning" onClick={this.pauseBackend}><span className='innerfooterbutton'>PAUSE</span></Button>
                                    }
                                    {running && pause && mode !==4 && 
                                        <Button className='mr-2 pr-1 footerbtn' color="warning" onClick={this.pauseBackend}><span className='innerfooterbutton'>RESUME</span></Button>
                                    }
                                    {!running && [1,2,3].includes(mode) &&
                                        <div className='footerswitch'>
                                            <Toggle className='footerswitch' value={pull} fn={ () => { this.setState({ pull: !pull }); } } />
                                        </div>
                                    }
                                </Col>
                                <Col className="text-center" xs="3">
                                    {running && mode !== 4 && 
                                        <div className='footerbtn'>
                                            <Button className='mr-2 pr-1 footerbtn' color="danger" onClick={this.stopBackend}><span className='innerfooterbutton'>STOP</span></Button>
                                        </div>
                                    }
                                    {!running &&
                                        <div>
                                            {[1,2,3].includes(mode) &&
                                                <Button className='mr-2 pr-1 footerbtn' color="success" onClick={this.sendDataToBackend}><span className='innerfooterbutton'>START</span></Button>
                                            }
                                            {mode === 4 &&
                                                <Button className='mr-2 pr-1 footerbtn' color="success" onClick={this.sendConfigToBackend}><span className='innerfooterbutton'>SAVE</span></Button>
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