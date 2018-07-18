import $ from 'jquery';
import React, { PureComponent } from 'react';
import { Input, Button, Layout, Icon } from 'antd';
import style from './CalculatorComp.less';

const { Content, Sider } = Layout;


function objDeepCopy(source) {
  // check it is the array or object
  const sourceCopy = source instanceof Array ? [] : {};

  for (const item in source) {
    if (source != null) {
      // recursively check the obj in array
      sourceCopy[item] = typeof source[item] === 'object' ? objDeepCopy(source[item]) : source[item];
    }
  }
  return sourceCopy;
}

let currentNum = '';
class CalculatorComp extends PureComponent {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.opClick = this.opClick.bind(this);
    this.numberClick = this.numberClick.bind(this);
    this.sendToBack = this.sendToBack.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.modeChange = this.modeChange.bind(this);

    this.state = {
      input: '',
      inputStr: [],
      OperatingMode: 0,
      answer: '',
    };
  }

  handleInputChange(e) {
    const value = e.target.value;
    // console.log(value);
    this.setState({ input: value });
  }

  // deal with the delete button
  handleDelete() {
    let { input } = this.state;
    const { inputStr } = this.state;
    const tempStr = objDeepCopy(inputStr);

  // remove the last item in array if lenght > 0
    if (tempStr.length > 0) {
    // remove the last item in array
      const lastItem = tempStr.pop();
      if (lastItem === 'exp(') {
        input = input.substring(0, input.length - 4);
      } else {
        input = input.substring(0, input.length - 1);
      }
    }


  // store back to this.state
    this.setState({
      input,
      inputStr: tempStr,
    });
  }

  numberClick(e) {
  // console.log(e.target.id);
    let { input } = this.state;
    // let tempStr = objDeepCopy(inputStr);
    input += e.target.id;
    currentNum += e.target.id;

    this.setState({
      input,
      // inputStr:objDeepCopy(tempStr),
    });
  }

  opClick(e) {
    let { input } = this.state;
    const { inputStr } = this.state;
    const tempStr = objDeepCopy(inputStr);
    input += e.target.id;

    tempStr.push(currentNum);
    currentNum = '';

    if (e.target.id === '+') {
      tempStr.push('a');
    } else {
      tempStr.push(e.target.id);
    }

    this.setState({
      input,
      inputStr: objDeepCopy(tempStr),
    });
  }

  sendToBack() {
    const { inputStr, OperatingMode } = this.state;
    // push the current one then clear
    inputStr.push(currentNum);
    currentNum = '';
console.log(parseInt(OperatingMode,0));
    const obj = {
      InputOp: inputStr,
      OperatingMode: parseInt(OperatingMode,0),
    };

    // sending the request
    $.post('http://47.96.95.207:8888/calProcess', {
      first: JSON.stringify(obj),
    },
        (data) => {
        // change back to json
          let sendBackData = JSON.parse(data);

        // IDK why this is so magic that I need convert from []byte->string->json
          sendBackData = JSON.parse(sendBackData);
        // console.log(sendBackData);
        // if no error show result
          if (sendBackData.ErrorMsg === 'Good') {
            let answer = '';
            if (OperatingMode === 0) {
              answer = sendBackData.Real;
            } else {
              answer = `${sendBackData.Real} + ${sendBackData.Imaginary}i`;
            }
		console.log(answer);
            this.setState({
              answer,
            });
          // if there is error show error
          } else {
            this.setState({
              answer: sendBackData.ErrorMsg,
            });
          }
        });

    // reset everything
    this.setState({
      input: '',
      inputStr: [],
    });
  }

  modeChange(e) {
    this.setState({
      OperatingMode: e.target.id,
    });
console.log(e.target);
  }


  render() {
    const { input, answer, OperatingMode } = this.state;
    let currentName = '';
    // remember here is string
    if (OperatingMode === '0') {
      currentName = 'Normal Mode';
    } else if (OperatingMode === '1') {
      currentName = 'Imaginary Mode';
    } else {
      currentName = 'Absolute Mode';
    }

	console.log(currentName);

    return (
      <Layout>
        <div className={style.modeName}>
          <h3>Current Mode</h3>
          <h3>{OperatingMode}</h3>
          <h3>{currentName}</h3>
        </div>
        <Layout className={style.outputPanel}>
          <Content>
            <h1>Operation</h1>
            <Input className={style.outputText} value={input} placeholder="Operation" />
          </Content>
        </Layout>

        <Layout className={style.outputPanel}>
          <Content>
            <h1>Answer</h1>
            <Input value={answer} className={style.outputText} placeholder="Answer" />
          </Content>
        </Layout>
        <Layout className={style.inputPanel}>
          <Sider width={600} className={style.opPanel}>
            <div >
              <Button id="+" onClick={this.opClick} className={style.button}> + </Button>
              <Button id="-" onClick={this.opClick} className={style.button}> - </Button>
              <Button id="*" onClick={this.opClick} className={style.button}> * </Button>
              <Button id="/" onClick={this.opClick} className={style.button}> / </Button>
              <Button id="(" onClick={this.opClick} className={style.button}> ( </Button>
              <Button id=")" onClick={this.opClick} className={style.button}> ) </Button>
              <Button id="=" onClick={this.sendToBack} className={style.button}> = </Button>
              <Button id="<" onClick={this.handleDelete} className={style.button}> <Icon type="left-square-o" /> </Button>
              <Button id="^" onClick={this.opClick} className={style.button}> ^ </Button>
              <Button id="exp(" onClick={this.opClick} className={style.button}> exp </Button>
              <Button id="i" onClick={this.numberClick} className={style.button}> i </Button>
              <br />
              <Button id={0} onClick={this.modeChange} className={style.modeButton}> Real </Button>
              <Button
                id={1}
                onClick={this.modeChange}
                className={style.modeButton}
              > Imaginary </Button>
              <Button
                id={2}
                onClick={this.modeChange}
                className={style.modeButton}
              > Absolute </Button>

            </div>
          </Sider>

          <Content>
            <Button id="1" onClick={this.numberClick} className={style.button}> 1 </Button>
            <Button id="2" onClick={this.numberClick} className={style.button}> 2 </Button>
            <Button id="3" onClick={this.numberClick} className={style.button}> 3 </Button>
            <br />
            <Button id="4" onClick={this.numberClick} className={style.button}> 4 </Button>
            <Button id="5" onClick={this.numberClick} className={style.button}> 5 </Button>
            <Button id="6" onClick={this.numberClick} className={style.button}> 6 </Button>
            <br />
            <Button id="7" onClick={this.numberClick} className={style.button}> 7 </Button>
            <Button id="8" onClick={this.numberClick} className={style.button}> 8 </Button>
            <Button id="9" onClick={this.numberClick} className={style.button}> 9 </Button>
            <br />
            <Button id="0" onClick={this.numberClick} className={style.button}> 0 </Button>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default CalculatorComp;
