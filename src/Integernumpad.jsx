import React from 'react'

import Numpad from 'react-numpad';

class Integernumpad extends React.Component {
    render() {
      return (
        <Numpad.Number
            onChange={(value) => this.props.fn(value)}
            //label={'Total'}
            //placeholder={'my placeholder'}
            className="w-100"
            width="100%"
            //theme={Consts.numpadtheme}
            negative={false}
            //position="fullscreen"
            value={this.props.value}
            decimal={this.props.decimal}
        >
            <input className="w-100 p-1"></input>
        </Numpad.Number>
      );
    }
}

export default Integernumpad;
