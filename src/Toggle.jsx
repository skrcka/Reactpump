import React from 'react'

import ToggleButton from 'react-toggle-button'

class Toggle extends React.Component {
    render() {
      return (
        <ToggleButton
          value={ this.props.value }
          onToggle={this.props.fn}
          inactiveLabel={'Push'}
          inactiveLabelStyle={{"color": "white"}}
          activeLabel={'Pull'}
          activeLabelStyle={{'color': 'white'}}
          colors={{
              activeThumb: {
                base: 'rgb(250,250,250)',
              },
              inactiveThumb: {
                base: 'rgb(250,250,250)',
              },
              active: {
                base: 'rgb(65,66,68)',
                hover: 'rgb(95,96,98)',
              },
              inactive: {
                base: 'rgb(65,66,68)',
                hover: 'rgb(95,96,98)',
              }
            }}
          trackStyle={{
              position: 'absolute',
              height: 32,
              width: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
          }}
          thumbStyle={{
              position: 'absolute',
              width: 37,
              height: 37,
              boxShadow: `0 0 2px rgba(0,0,0,.12),0 2px 4px rgba(0,0,0,.24)`,
              display: 'flex',
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
          }}
          thumbStyleHover={{
              width: 38,
              height: 38,
          }}
          thumbAnimateRange={[0, 52]}
          animateThumbStyleHover={(n) => {
              return {
              boxShadow: `0 0 ${2 + 4*n}px rgba(0,0,0,.16),0 ${2 + 3*n}px ${4 + 8*n}px rgba(0,0,0,.32)`,
              }
          }} />
      );
    }
}

export default Toggle;
