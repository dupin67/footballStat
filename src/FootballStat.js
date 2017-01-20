import React from 'react';
import logo from './logo.svg';
import './FootballStat.css';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Modal from 'react-bootstrap/lib/Modal';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom';
import Duration from './Duration';
import DurationDate from './DurationDate';
import Table from 'react-bootstrap/lib/Table';
import {HotKeys} from 'react-hotkeys';
import { TransitionView, Calendar } from 'react-date-picker';
import 'react-date-picker/index.css';

class VideoPlayer extends React.Component {
  state = {
    url: "http://reviewtranslations.com/big_buck_bunny.mp4",
    volume: 0.8,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    markTime: 0
  }
  load = url => {
    this.setState({
      url,
      played: 0,
      loaded: 0
    })
  }
  playPause = () => {
    this.props.playing ? this.props.pausePlaying() : this.props.resumePlaying();
  }
  setVolume = e => {
    this.setState({ volume: parseFloat(e.target.value) })
  }
   setPlaybackRate = e => {
    this.setState({ playbackRate: parseFloat(e.target.value) })
  }
  onSeekMouseDown = e => {
    this.setState({ seeking: true })
  }
  onSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) });
    this.props.setPlayTime(this.props.startTime + (this.state.duration * this.state.played - this.state.markTime) * 1000); 
  }
  onSeekMouseUp = e => {
    this.setState({ seeking: false });
    this.player.seekTo(parseFloat(e.target.value))
  }
  onProgress = state => {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
  }
  onClickFullscreen = () => {
    screenfull.request(findDOMNode(this.player))
  }

  close() {
    this.props.resumePlaying();
    this.setState({ showModal: false });
  }

  open(id) {
    this.props.pausePlaying();
    this.setState({
      markTime: this.state.duration * this.state.played,
      showModal: true 
    });
  }  

  setPlayTime = () => {
    this.props.setPlayTime(this.props.startTime + (this.state.duration * this.state.played - this.state.markTime) * 1000); 
  }

  render() {
    const {
      url, volume,
      played, duration,
      playbackRate,
      soundcloudConfig,
      vimeoConfig,
      youtubeConfig,
      fileConfig
    } = this.state
    return (
      <div className="FootballStat-video">
        <HotKeys>
        </HotKeys>
        <div className="FootballStat-video-url">
          <input className="FootballStat-video-url-input" ref={input => { this.urlInput = input }} type='text' placeholder='Enter URL' />
          <Button bsStyle="primary" onClick={() => this.setState({ url: this.urlInput.value })}>Load</Button>
        </div>
        <ReactPlayer
          ref={player => { this.player = player }}
          className='react-player'
          width={960}
          height={540}
          url={url}
          playing={this.props.playing}
          playbackRate={playbackRate}
          volume={volume}
          soundcloudConfig={soundcloudConfig}
          vimeoConfig={vimeoConfig}
          youtubeConfig={youtubeConfig}
          fileConfig={fileConfig}
          onReady={() => console.log('onReady')}
          onStart={() => console.log('onStart')}
          onPlay={() => this.props.resumePlaying()}
          onPause={() => {
                            this.props.pausePlaying();
                         } 
                  }
          onBuffer={() => console.log('onBuffer')}
          onEnded={() => this.props.pausePlaying()}
          onError={e => console.log('onError', e)}
          onProgress={this.onProgress}
          onDuration={duration => this.setState({ duration })}
       />
        <div>
          <input className="FootballStat-video-seek"
            type='range' min={0} max={1} step='any'
            value={played}
            onMouseDown={this.onSeekMouseDown}
            onChange={this.onSeekChange}
            onMouseUp={this.onSeekMouseUp}
         />
          <input className="FootballStat-video-volume"
            type='range'
            min={0}
            max={1}
            step='any'
            value={volume}
            onChange={this.setVolume}
         />
        </div>
        <div>
          <ButtonToolbar className="FootballStat-video-buttonToolbar">
            <Button onClick={this.playPause}>{this.props.playing ? 'Pause(P)' : 'Play(P)'}</Button>
            <Button className="FootballStat-fullscreen" onClick={this.onClickFullscreen}>Fullscreen</Button>
            <Button onClick={this.setPlaybackRate} value={1}>1.0x</Button>
            <Button onClick={this.setPlaybackRate} value={1.5}>1.5x</Button>
            <Button onClick={this.setPlaybackRate} value={2}>2.0x</Button>
          </ButtonToolbar>
          <Button className="FootballStat-video-buttonSync" onClick={this.open.bind(this)}>同步</Button>
          <p className="FootballStat-video-duration">视频时间 <Duration seconds={duration * played}/>/<Duration seconds={duration} />&nbsp;比赛时间 <DurationDate miniseconds={this.props.startTime + (this.state.duration * this.state.played - this.state.markTime) * 1000} /></p>
        </div>
        <div>
          <Modal show={this.state.showModal} onHide={this.close.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>同步比赛时间</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="FootballStat-editActionDetail">
                <TransitionView>
                  <Calendar
                    dateFormat="YYYY/MM/DD HH:mm:ss"
                    defaultDate="2017/01/13 16:23:56"
                    onChange={(dateString, { dateMoment, timestamp}) => {
                      this.props.setStartTime(timestamp);
                    }}
                  />
                </TransitionView>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.close.bind(this)}>Close</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }
}

class ActionButtonGroup extends React.Component {
  render() {
    return (
      <div className="FootballStat-actionButton">
        <ButtonToolbar className="FootballStat-buttonToolbar">
          <Button bsStyle="primary" onClick={ () => this.props.selectAction("pass") }>传球(Q)</Button>
          <Button bsStyle="primary" onClick={ () => this.props.selectAction("through") }>直塞(W)</Button>
          <Button bsStyle="primary" onClick={ () => this.props.selectAction("cross") }>传中(E)</Button>
        </ButtonToolbar>
        <ButtonToolbar className="FootballStat-buttonToolbar">
          <Button bsStyle="primary" onClick={ () => this.props.selectAction("dribble") }>过人(R)</Button>
          <Button bsStyle="primary" onClick={ () => this.props.selectAction("assist") }>助攻(T)</Button>
          <Button bsStyle="primary" onClick={ () => this.props.selectAction("shoot") }>射门(Y)</Button>
        </ButtonToolbar>
        <ButtonToolbar className="FootballStat-buttonToolbar">
          <Button bsStyle="primary" onClick={ () => this.props.selectAction("offside") }>越位(U)</Button>
        </ButtonToolbar>
        <ButtonToolbar className="FootballStat-buttonToolbar">
          <Button bsStyle="warning" onClick={ () => this.props.selectAction("tackle") }>抢断(A)</Button>
          <Button bsStyle="warning" onClick={ () => this.props.selectAction("interception") }>截断(S)</Button>
          <Button bsStyle="warning" onClick={ () => this.props.selectAction("block") }>阻挡(D)</Button>
        </ButtonToolbar>
        <ButtonToolbar className="FootballStat-buttonToolbar">
          <Button bsStyle="warning" onClick={ () => this.props.selectAction("clearance") }>解围(F)</Button>
          <Button bsStyle="warning" onClick={ () => this.props.selectAction("save") }>扑救(G)</Button>
          <Button bsStyle="warning" onClick={ () => this.props.selectAction("owngoal") }>乌龙(H)</Button>
        </ButtonToolbar>
        <ButtonToolbar className="FootballStat-buttonToolbar">
          <Button bsStyle="info" onClick={ () => this.props.selectAction("free") }>任意(Z)</Button>
          <Button bsStyle="info" onClick={ () => this.props.selectAction("corner") }>角球(X)</Button>
          <Button bsStyle="info" onClick={ () => this.props.selectAction("penalty") }>点球(C)</Button>
        </ButtonToolbar>
        <ButtonToolbar className="FootballStat-buttonToolbar">
          <Button bsStyle="danger" onClick={ () => this.props.selectAction("foul") }>犯规(V)</Button>
          <Button bsStyle="danger" onClick={ () => this.props.selectAction("yellow") }>黄牌(B)</Button>
          <Button bsStyle="danger" onClick={ () => this.props.selectAction("red") }>红牌(N)</Button>
        </ButtonToolbar>
      </div>
    );
  }
};

var numbers = ["NA", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var actions = [{value: "", tag: ""},
               {value: "pass", tag: "传球"},
               {value: "through", tag: "直塞"},
               {value: "cross", tag: "传中"},
               {value: "dribble", tag: "过人"},
               {value: "assist", tag: "助攻"},
               {value: "shoot", tag: "射门"},
               {value: "offside", tag: "越位"},
               {value: "tackle", tag: "抢断"},
               {value: "interception", tag: "截断"},
               {value: "block", tag: "阻挡"},
               {value: "clearance", tag: "解围"},
               {value: "save", tag: "扑救"},
               {value: "owngoal", tag: "乌龙"},
               {value: "free", tag: "任意"},
               {value: "corner", tag: "角球"},
               {value: "penalty", tag: "点球"},
               {value: "foul", tag: "犯规"},
               {value: "yellow", tag: "黄牌"},
               {value: "red", tag: "红牌"}];

class ActionPass extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      type: this.props.originalRecord ? this.props.originalRecord.type : "short",
      method: this.props.originalRecord ? this.props.originalRecord.method : "other",
      threat: this.props.originalRecord ? this.props.originalRecord.threat : false
    });
    this.setType = this.setType.bind(this);
    this.setMethod = this.setMethod.bind(this);
    this.setThreat = this.setThreat.bind(this);
  }
  
  setType(e) {
    this.setState({
      type: e.target.value
    });
    this.props.setSpecificProp({"id": 1, "key": "type", "value": e.target.value});
  }
  
  setMethod(e) {
    this.setState({
      method: e.target.value
    });
    this.props.setSpecificProp({"id": 2, "key": "method", "value": e.target.value});
  }
  
  setThreat(e) {
    this.setState({
      threat: e.target.checked
    });
    this.props.setSpecificProp({"id": 3, "key": "threat", "value": e.target.checked});
  }
  
  render() {
    return (
        <tbody>
          <tr>
            <td>类型</td>
            <td>
              <span>
                <input id="shortPass" type="radio" name="passType" value="short" checked={this.state.type === "short"} onChange={this.setType} /><label htmlFor="shortPass">短传</label>&emsp;
                <input id="longPass" type="radio" name="passType" value="long" checked={this.state.type === "long"} onChange={this.setType} /><label htmlFor="longPass">长传</label>
              </span>
            </td>
          </tr>
          <tr>
            <td>方式</td>
            <td>
              <span>
                <input id="methodHead" type="radio" name="passMethod" value="head" checked={this.state.method === "head"} onChange={this.setMethod} /><label htmlFor="methodHead">头球</label>&emsp;
                <input id="methodOther" type="radio" name="passMethod" value="other" checked={this.state.method === "other"} onChange={this.setMethod} /><label htmlFor="methodOther">其它</label>
              </span>
            </td>
          </tr>
          <tr>
            <td>其它</td>
            <td>威胁球<input type="checkbox" onChange={this.setThreat} checked={this.state.threat === true} /></td>
          </tr>
        </tbody>
    );
  }
  
  componentDidMount() {
    this.props.setSpecificProp({"id": 1, "key": "type", "value": this.props.originalRecord ? this.props.originalRecord.type : "short"});
    this.props.setSpecificProp({"id": 2, "key": "method", "value": this.props.originalRecord ? this.props.originalRecord.method : "other"});
    this.props.setSpecificProp({"id": 3, "key": "threat", "value": this.props.originalRecord ? this.props.originalRecord.threat : false});
  }
}

class ActionThroughOrCross extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      threat: this.props.originalRecord ? this.props.originalRecord.threat : false
    });

    this.setThreat = this.setThreat.bind(this);
  }
  
  setThreat(e) {
    this.setState({
      threat: e.target.checked
    });
    this.props.setSpecificProp({"id": 3, "key": "threat", "value": e.target.checked});
  }
  
  render() {
    return (
      <tbody>
        <tr>
          <td>其它</td>
          <td>威胁球<input type="checkbox" onChange={this.setThreat} checked={this.state.threat === true} /></td>
        </tr>
      </tbody>
    );
  }
  
  componentDidMount() {
    this.props.setSpecificProp({"id": 3, "key": "threat", "value": this.props.originalRecord ? this.props.originalRecord.threat : false});
  }
}

class ActionCommon extends React.Component {
  render() {
    return (
      null
    );
  }
}

class ActionAssist extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      threat: true
    });
    this.setThreat = this.setThreat.bind(this);
  }
  
  setThreat(e) {
    this.setState({
      threat: e.target.checked
    });
    this.props.setSpecificProp({"id": 3, "key": "threat", "value": e.target.checked});
  }
  
  render() {
    return (
      <tbody>
        <tr>
          <td>其它</td>
          <td>威胁球<input type="checkbox" onChange={this.setThreat} checked="true" disabled="true"></input></td>
        </tr>
      </tbody>
    );
  }
  
  componentDidMount() {
    this.props.setSpecificProp({"id": 3, "key": "threat", "value": false});
  }
}

class ActionShoot extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      target: this.props.originalRecord ? this.props.originalRecord.target : "on",
      method: this.props.originalRecord ? this.props.originalRecord.method : "rightFoot",
      penaltyArea: this.props.originalRecord ? this.props.originalRecord.penaltyArea : "inside"
    });
    this.setTarget = this.setTarget.bind(this);
    this.setMethod = this.setMethod.bind(this);
    this.setPenaltyArea = this.setPenaltyArea.bind(this);
  }
  
  setTarget(e) {
    this.setState({
      target: e.target.value
    });
    this.props.setSpecificProp({"id": 1, "key": "target", "value": e.target.value});
  }
  
  setMethod(e) {
    this.setState({
      method: e.target.value
    });
    this.props.setSpecificProp({"id": 2, "key": "method", "value": e.target.value});
  }
  
  setPenaltyArea(e) {
    this.setState({
      penaltyArea: e.target.value
    });
    this.props.setSpecificProp({"id": 3, "key": "penaltyArea", "value": e.target.value});
  }
  
  render() {
    return (
      <tbody>
        <tr>
          <td>范围</td>
          <td>
            <span>
              <input id="onTarget" type="radio" name="target" value="on" checked={this.state.target === "on"} onChange={this.setTarget} /><label htmlFor="onTarget">门框以内</label>&emsp;
              <input id="offTarget" type="radio" name="target" value="off" checked={this.state.target === "off"} onChange={this.setTarget} /><label htmlFor="offTarget">门框以外</label>
            </span>
          </td>
        </tr>
        <tr>
          <td>方式</td>
          <td>
            <span>
              <input id="methodRightFoot" type="radio" name="shootMethod" value="rightFoot" checked={this.state.method === "rightFoot"} onChange={this.setMethod} /><label htmlFor="methodRightFoot">右脚</label>
              <input id="methodLeftFoot" type="radio" name="shootMethod" value="leftFoot" checked={this.state.method === "leftFoot"} onChange={this.setMethod} /><label htmlFor="methodLeftFoot">左脚</label>
              <input id="methodHead" type="radio" name="shootMethod" value="head" checked={this.state.method === "head"} onChange={this.setMethod} /><label htmlFor="methodHead">头球</label>
              <input id="methodOther" type="radio" name="shootMethod" value="other" checked={this.state.method === "other"} onChange={this.setMethod} /><label htmlFor="methodOther">其它</label>
            </span>
          </td>
        </tr>
        <tr>
          <td>位置</td>
          <td>
            <span>
              <input id="insidePA" type="radio" name="PenaltyArea" value="inside" checked={this.state.penaltyArea === "inside"} onChange={this.setPenaltyArea} /><label htmlFor="insidePA">禁区以内</label>&emsp;
              <input id="outsidePA" type="radio" name="PenaltyArea" value="outside" checked={this.state.penaltyArea === "outside"} onChange={this.setPenaltyArea} /><label htmlFor="outsidePA">禁区以外</label>
            </span>
          </td>
        </tr>
      </tbody>
    );
  }
  
  componentDidMount() {
    this.props.setSpecificProp({"id": 1, "key": "target", "value": this.props.originalRecord ? this.props.originalRecord.target : "on"});
    this.props.setSpecificProp({"id": 2, "key": "method", "value": this.props.originalRecord ? this.props.originalRecord.method : "rightFoot"});
    this.props.setSpecificProp({"id": 3, "key": "penaltyArea", "value": this.props.originalRecord ? this.props.originalRecord.penaltyArea : "inside"});
  }
}

class ActionFoulsOrYellowOrRed extends React.Component {
  constructor(props) {
    super(props);
    this.selectOpponentPlayer = this.selectOpponentPlayer.bind(this);
  }
  
  selectOpponentPlayer(e) {
    this.props.selectOpponentPlayer(e.target.value);
  }
  
  render() {
    return (
      <tbody>
        <tr>
          <td>对方</td>
          <td>
            <select className="FootballStat-select" onChange={this.selectOpponentPlayer} defaultValue={this.props.originalRecord ? this.props.originalRecord.opponent : "NA"}>
              {numbers.map((number) => <option key={number.toString()} value={number}>{number}</option>)}
            </select>
            <span>号</span>
          </td>
        </tr>
      </tbody>
    );
  }
}

class ActionTackle extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      method: this.props.originalRecord ? this.props.originalRecord.method : "common",
    });
    this.setMethod = this.setMethod.bind(this);
  }
  
  setMethod(e) {
    this.setState({
      method: e.target.value
    });
    this.props.setSpecificProp({"id": 2, "key": "method", "value": e.target.value});
  }
  
  render() {
    return (
      <tbody>
        <tr>
          <td>方式</td>
          <td>
            <span>
              <input id="methodCommon" type="radio" name="tackleMethod" value="common" checked={this.state.method === "common"} onChange={this.setMethod} /><label htmlFor="methodCommon">普通</label>&emsp;
              <input id="methodSlide" type="radio" name="tackleMethod" value="slide" checked={this.state.method === "slide"} onChange={this.setMethod} /><label htmlFor="methodLeftFoot">铲球</label>&emsp;
              <input id="methodHead" type="radio" name="tackleMethod" value="head" checked={this.state.method === "head"} onChange={this.setMethod} /><label htmlFor="methodHead">头球</label>&emsp;
            </span>
          </td>
        </tr>
      </tbody>
    );
  }
  
  componentDidMount() {
    this.props.setSpecificProp({"id": 2, "key": "method", "value": this.props.originalRecord ? this.props.originalRecord.method : "common"});
  }
}

class ActionFree extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      type: this.props.originalRecord ? this.props.originalRecord.type : "direct",
    });
    this.setType = this.setType.bind(this);
  }
  
  setType(e) {
    this.setState({
      type: e.target.value
    });
    this.props.setSpecificProp({"id": 1, "key": "type", "value": e.target.value});
  }
  
  render() {
    return (
      <tbody>
        <tr>
          <td>类型</td>
          <td>
            <span>
              <input id="typeDirect" type="radio" name="freeType" value="direct" checked={this.state.type === "direct"} onChange={this.setType} /><label htmlFor="typeDirect">直接任意球</label>&emsp;
              <input id="typeIndirect" type="radio" name="freeType" value="indirect" checked={this.state.type === "indirect"} onChange={this.setType} /><label htmlFor="typeIndirect">间接任意球</label>
             </span>
          </td>
        </tr>
      </tbody>
    );
  }
  
  componentDidMount() {
    this.props.setSpecificProp({"id": 1, "key": "type", "value": this.props.originalRecord ? this.props.originalRecord.type : "direct"});
  }
}

class ActionCorner extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      type: this.props.originalRecord ? this.props.originalRecord.type : "non-tactical",
    });
    this.setType = this.setType.bind(this);
  }
  
  setType(e) {
    this.setState({
      type: e.target.value
    });
    this.props.setSpecificProp({"id": 1, "key": "type", "value": e.target.value});
  }
  
  render() {
    return (
      <tbody>
        <tr>
          <td>类型</td>
          <td>
            <span>
              <input id="typeNonTactical" type="radio" name="cornerType" value="non-tactical" checked={this.state.type === "non-tactical"} onChange={this.setType} /><label htmlFor="typeNonTactical">非战术角球</label>&emsp;
              <input id="typeTactical" type="radio" name="cornerType" value="tactical" checked={this.state.type === "tactical"} onChange={this.setType} /><label htmlFor="typeTactical">战术角球</label>
             </span>
          </td>
        </tr>
      </tbody>
    );
  }
  
  componentDidMount() {
    this.props.setSpecificProp({"id": 1, "key": "type", "value": this.props.originalRecord ? this.props.originalRecord.type : "non-tactical"});
  }
}

class OpponentRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: this.props.opponentActions[0].value
    }
    this.setOpponentRecord = this.setOpponentRecord.bind(this);
    this.selectOpponentAction = this.selectOpponentAction.bind(this);
  };

  setOpponentRecord(e) {
    this.props.setOpponentRecord(e.target.checked);
  }
  
  selectOpponentAction(e) {
    this.setState({
      action: e.target.value
    });
    this.props.setOpponentAction(e.target.value);
  }
  
  render() {
    var specific, opponentToPlayer;
    var isSinglePlayerAction = false;

    if (this.props.opponentActions === null) {
      return null;
    }
    
    switch (this.state.action) {
      case "dribble":
      case "shoot":
      case "tackle":
      case "interception":
      case "block":
      case "clearance":
      case "save":
        isSinglePlayerAction = true;
        break;
      default:
        isSinglePlayerAction = false;
        break;
    }

    if (isSinglePlayerAction === false) {
      opponentToPlayer = 
        <span> => <select className="FootballStat-select" onChange={this.props.selectOpponentToPlayer}>
          {numbers.map((number) => <option key={number.toString()} value={number}>{number}</option>)}
        </select>号</span>;
    } else {
      opponentToPlayer = null;
    }    

    switch (this.state.action) {
      case "pass":
        specific = <ActionPass setSpecificProp={this.props.setOpponentActionSpecificProp} />
        break;
      case "through":
        specific = <ActionThroughOrCross setSpecificProp={this.props.setOpponentActionSpecificProp} />
        break;
      case "cross":
        specific = <ActionThroughOrCross setSpecificProp={this.props.setOpponentActionSpecificProp} />
        break;
      case "dribble":
        specific = <ActionCommon />;
        break;
      case "assist":
        specific = <ActionAssist setSpecificProp={this.props.setOpponentActionSpecificProp} />
        break;
      case "shoot":
        specific = <ActionShoot setSpecificProp={this.props.setOpponentActionSpecificProp} />
        break;
      case "tackle":
        specific = <ActionTackle setSpecificProp={this.props.setOpponentActionSpecificProp} />
        break;
      case "interception":
        specific = <ActionCommon />
        break;
      case "block":
        specific = <ActionCommon />
        break;
      case "clearance":
        specific = <ActionCommon />
        break;
      case "save":
        specific = <ActionCommon />
        break;
      default:
        specific = null;
        break;
    }    

    return (
      <div className="RecordDetailTable">
        <p>添加对方记录<input type="checkbox" ref={"addOpponentRecord"} onChange={this.setOpponentRecord} defaultChecked={true}/></p>
        <Table bordered condensed hover>
          <colgroup>
            <col className="FootballStat-actionRecorderDetail-item" />
            <col className="FootballStat-actionRecorderDetail-value" />
          </colgroup>
          <tbody>
            <tr>
              <td>球队</td>
              <td>
                {this.props.team === "host" ? "客队" : "主队"}
              </td>
            </tr>
            <tr>
              <td>动作</td>
              <td>
                <select className="FootballStat-select" onChange={this.selectOpponentAction}>
                  {this.props.opponentActions.map((action) => <option key={action.value.toString()} value={action.value}>{action.tag}</option>)}
                </select>
              </td>
            </tr>
            <tr>
              <td>球员</td>
              <td>
                <select className="FootballStat-select" ref={"opponentFromPlayer"} onChange={this.props.selectOpponentFromPlayer}>
                  {numbers.map((number) => <option key={number.toString()} value={number}>{number}</option>)}
                </select>
                <span>号</span>
                {opponentToPlayer}
              </td>
            </tr>
          </tbody>
          {specific}
          <tbody>
          </tbody>
          <tbody>
            <tr>
              <td>结果</td>
              <td>
                  {this.props.result === "success" ? "失败" : "成功"}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
  
  componentDidMount() {
    this.props.setOpponentAction(this.props.opponentActions[0].value);
    this.props.setOpponentRecord(true);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.action !== this.props.action) {
      //current action changed
      this.setState({
        action: nextProps.opponentActions[0].value
      })
      this.props.setOpponentAction(this.state.action);
    }
  }
} 

class ActionRecorderDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      fromPlayer: "NA",
      toPlayer: "NA",
      opponentPlayer: "NA",
      result: "success",
      specificKey1: "NA",
      specificVal1: "NA",
      specificKey2: "NA",
      specificVal2: "NA",
      specificKey3: "NA",
      specificVal3: "NA",
      opponentRecord: false,
      opponentAction: "NA",
      opponentFromPlayer: "NA",
      opponentToPlayer: "NA",
      opponentActionResult: "NA",
      opponentActionSpecificKey1: "NA",
      opponentActionSpecificVal1: "NA",
      opponentActionSpecificKey2: "NA",
      opponentActionSpecificVal2: "NA",
      opponentActionSpecificKey3: "NA",
      opponentActionSpecificVal3: "NA"
    });
    this.handleAddRec = this.handleAddRec.bind(this);
    this.selectAction = this.selectAction.bind(this);
    this.setTeam = this.setTeam.bind(this);
    this.switchTeam = this.switchTeam.bind(this);
    this.selectFromPlayer = this.selectFromPlayer.bind(this);
    this.selectToPlayer = this.selectToPlayer.bind(this);
    this.selectOpponentPlayer = this.selectOpponentPlayer.bind(this);
    this.setResult = this.setResult.bind(this);
    this.setSpecificProp = this.setSpecificProp.bind(this);
    this.setOpponentRecord = this.setOpponentRecord.bind(this);
    this.selectOpponentAction = this.selectOpponentAction.bind(this);
    this.setOpponentAction = this.setOpponentAction.bind(this);
    this.selectOpponentFromPlayer = this.selectOpponentFromPlayer.bind(this)
    this.selectOpponentToPlayer = this.selectOpponentToPlayer.bind(this);
    this.setOpponentActionSpecificProp = this.setOpponentActionSpecificProp.bind(this);
    this.getResultPerAction = this.getResultPerAction.bind(this);
  }
  
  handleAddRec() {
    if (this.props.action === "") {
      this.props.setWarning("未选定动作")
      return;
    }

    var record = {
      action: this.props.action,
      team: this.props.team,
      time: this.props.time,
      from: this.state.fromPlayer,
      to: this.state.toPlayer,
      opponent: this.state.opponentPlayer,
      result: this.state.result,
    }
    record[this.state.specificKey1] = this.state.specificVal1;
    record[this.state.specificKey2] = this.state.specificVal2;
    record[this.state.specificKey3] = this.state.specificVal3;
    var result = this.props.addRec(record);
    if (result === false) return;
    
    if (this.state.opponentRecord === true) {
      record = {
        action: this.state.opponentAction,
        team: this.props.team === "host" ? "guest" : "host",
        time: this.props.time + 1, // add 1 minisecond so the opponent record will sort before the original record
        from: this.state.opponentFromPlayer,
        to: this.state.opponentToPlayer,
        result: this.state.result === "success" ? "failure" : "success"
      }
      record[this.state.specificKey1] = this.state.specificVal1;
      record[this.state.specificKey2] = this.state.specificVal2;
      record[this.state.specificKey3] = this.state.specificVal3;
      result = this.props.addRec(record);
      
      if (result === false) return;
    }
        
    this.props.setWarning(null);
    
    // remove component record input
    this.setState({
      fromPlayer: "NA",
      toPlayer: "NA",
      opponentPlayer: "NA",
      result: "success",
      specificKey1: "NA",
      specificVal1: "NA",
      specificKey2: "NA",
      specificVal2: "NA",
      specificKey3: "NA",
      specificVal3: "NA",
      opponentRecord: false,
      opponentAction: "NA",
      opponentFromPlayer: "NA",
      opponentToPlayer: "NA",
      opponentActionResult: "NA",
      opponentActionSpecificKey1: "NA",
      opponentActionSpecificVal1: "NA",
      opponentActionSpecificKey2: "NA",
      opponentActionSpecificVal2: "NA",
      opponentActionSpecificKey3: "NA",
      opponentActionSpecificVal3: "NA"
    });
    this.props.selectAction("");
    this.props.resumePlaying();
    this.refs.actionSelect.focus();
  }
  
  setResult(e) {
    this.setState({
      result: e.target.value,
    });
  }
  
  setTeam(e) {
    this.props.setTeam(e.target.value);
  }
  
  switchTeam() {
    var temp_team = this.props.team === "host" ? "guest" : "host";
    this.props.setTeam(temp_team);
  }
  
  selectAction(e) {
    this.props.selectAction(e.target.value);
  }
  
  selectFromPlayer(e) {
    this.setState({
      fromPlayer: e.target.value
    });
  }

  selectToPlayer(e) {
    this.setState({
      toPlayer: e.target.value
    });
  }
  
  selectOpponentPlayer(player) {
    this.setState({
      opponentPlayer: player
    });
  }
  
  setSpecificProp(specific) {
    switch (specific.id)
    {
      case 1:
        this.setState({
          specificKey1: specific.key,
          specificVal1: specific.value
        })
        break;
      case 2:
        this.setState({
          specificKey2: specific.key,
          specificVal2: specific.value
        })
        break;
      case 3:
        this.setState({
          specificKey3: specific.key,
          specificVal3: specific.value
        })
        break;
      default:
        //do nothing;
    }
  }
  
  setOpponentRecord(enable) {
    this.setState({
      opponentRecord: enable
    });
  }  
  
  selectOpponentAction(action) {
    this.setState({
      opponentAction: action
    });
  }
  
  setOpponentAction(action) {
    this.setState({
      opponentAction: action
    })
  }
  
  selectOpponentFromPlayer(e) {
    this.setState({
     opponentFromPlayer: e.target.value
    });
  }
  
  selectOpponentToPlayer(e) {
    this.setState({
     opponentToPlayer: e.target.value
    });
  }
  
  setOpponentActionSpecificProp(specific) {
    switch (specific.id)
    {
      case 1:
        this.setState({
          opponentActionSpecificKey1: specific.key,
          opponentActionSpecificVal1: specific.value
        });
        break;
      case 2:
        this.setState({
          opponentActionSpecificKey2: specific.key,
          opponentActionSpecificVal2: specific.value
        });
        break;
      case 3:
        this.setState({
          opponentActionSpecificKey3: specific.key,
          opponentActionSpecificVal3: specific.value
        });
        break;
      default:
        break;
        //do nothing;
    }
  }

  getResultPerAction(action) {
    var result = "success";
    switch (action) {
      case "offside":
      case "owngoal":
      case "free":
      case "corner":
      case "foul":
      case "yellow":
      case "red":
        result = "NA";
        break;
      default:
        break;
    } 
    return result;
  }
  
  render() {
    var basic, specific, toPlayer;
    var isSinglePlayerAction = false;
    var opponentRecord = null;
    var opponentActions = null;
    var isFixedResult = false;

    switch (this.props.action) {
      case "dribble":
      case "shoot":
      case "offside":
      case "tackle":
      case "interception":
      case "block":
      case "clearance":
      case "save":
      case "owngoal":
      case "free":
      case "corner":
      case "penalty":
      case "foul":
      case "yellow":
      case "red":
        isSinglePlayerAction = true;
        break;
      default:
        isSinglePlayerAction = false;
        break;
    }
    
    switch (this.props.action) {      
      case "pass":
      case "through":
      case "cross":
        if (this.state.result === "failure") {
          opponentActions = [{value: "interception", tag: "截断"},
                             {value: "clearance", tag: "解围"}];
        } else {
          opponentActions = null;
        }
        break;
      case "dribble":
        if (this.state.result === "failure") {
          opponentActions = [{value: "tackle", tag: "抢断"},
                             {value: "clearance", tag: "解围"}];
        } else {
          opponentActions = [{value: "tackle", tag: "抢断"}];
        }
        break;
      case "shoot":
        opponentActions = [{value: "save", tag: "扑救"},
                           {value: "block", tag: "阻挡"}];
        break;
      case "tackle":
        opponentActions = [{value: "dribble", tag: "过人"}];
        break;
      case "interception":
        opponentActions = [{value: "pass", tag: "传球"},
                           {value: "through", tag: "直塞"},
                           {value: "cross", tag: "传中"}];
        break;
      case "clearance":
        opponentActions = [{value: "pass", tag: "传球"},
                           {value: "through", tag: "直塞"},
                           {value: "cross", tag: "传中"},
                           {value: "dribble", tag: "过人"}]
        break;
      case "block":
      case "save":
        opponentActions = [{value: "shoot", tag: "射门"}];
        break;
      case "penalty":
        opponentActions = [{value: "save", tag: "扑救"}];
        break;
      default:
        opponentActions = null;
        break;
    }

    if (opponentActions === null) {
      opponentRecord = null;
    } else {
      opponentRecord = <OpponentRecord
                         action={this.props.action}
                         team={this.props.team}
                         fromPlayer={this.state.fromPlayer}
                         result={this.state.result}
                         setOpponentRecord={this.setOpponentRecord}
                         opponentActions={opponentActions}
                         setOpponentAction={this.setOpponentAction}
                         selectOpponentFromPlayer={this.selectOpponentFromPlayer}
                         selectOpponentToPlayer={this.selectOpponentToPlayer}
                         setOpponentActionSpecificProp={this.setOpponentActionSpecificProp} />;
    }

    switch (this.props.action) {
      case "assist":
      case "offside":
      case "owngoal":
      case "foul":
      case "yellow":
      case "red":
        isFixedResult = true;
        break;
      default:
        isFixedResult = false;
        break;
    }

    if (isSinglePlayerAction === false) {
      toPlayer = 
        <span> => <select className="FootballStat-select" value={this.state.toPlayer} onChange={this.selectToPlayer} >
          {numbers.map((number) => <option key={number.toString()} value={number}>{number}</option>)}
        </select>号</span>;
    } else {
      toPlayer = null;
    }    

    switch (this.props.action) {
      case "":
        specific = null;
        break;
      case "pass":
        specific = <ActionPass setSpecificProp={this.setSpecificProp} />
        break;
      case "through":
        specific = <ActionThroughOrCross setSpecificProp={this.setSpecificProp} />
        break;
      case "cross":
        specific = <ActionThroughOrCross setSpecificProp={this.setSpecificProp} />
        break;
      case "dribble":
        specific = <ActionCommon />;
        break;
      case "assist":
        specific = <ActionAssist setSpecificProp={this.setSpecificProp} />
        break;
      case "shoot":
        specific = <ActionShoot setSpecificProp={this.setSpecificProp} />
        break;
      case "offside":
        specific = <ActionCommon />
        break;
      case "tackle":
        specific = <ActionTackle setSpecificProp={this.setSpecificProp} />
        break;
      case "interception":
        specific = <ActionCommon />
        break;
      case "block":
        specific = <ActionCommon />
        break;
      case "clearance":
        specific = <ActionCommon />
        break;
      case "save":
        specific = <ActionCommon />
        break;
      case "owngoal":
        specific = <ActionCommon />
        break;
      case "free":
        specific = <ActionFree setSpecificProp={this.setSpecificProp} />
        break;
      case "corner":
        specific = <ActionCorner setSpecificProp={this.setSpecificProp} />
        break;
      case "penalty":
        specific = <ActionCommon />
        break;
      case "foul":
        specific = <ActionFoulsOrYellowOrRed selectOpponentPlayer={this.selectOpponentPlayer} />
        break;
      case "yellow":
        specific = <ActionFoulsOrYellowOrRed selectOpponentPlayer={this.selectOpponentPlayer} />
        break;
      case "red":
        specific = <ActionFoulsOrYellowOrRed selectOpponentPlayer={this.selectOpponentPlayer} />
        break;
      default:
        specific = null;
        break;
    }
    
    if (this.props.action === "") {
      basic = null;
    } else {
      basic =
        <Table bordered condensed hover>
          <colgroup>
            <col className="FootballStat-actionRecorderDetail-item" />
            <col className="FootballStat-actionRecorderDetail-value" />
          </colgroup>
          <tbody>
            <tr>
              <td>时间</td>
              <td>
                <DurationDate miniseconds={this.props.time} />
              </td>
            </tr>
            <tr>
              <td>球员</td>
              <td>
                <select className="FootballStat-select" autoFocus={true} ref={"fromPlayer"} value={this.state.fromPlayer} onChange={this.selectFromPlayer}>
                  {numbers.map((number) => <option key={number.toString()} value={number}>{number}</option>)}
                </select>
                <span>号</span>
                {toPlayer} 
              </td>
            </tr>
          </tbody>
          {specific}
          <tbody>
            <tr>
              <td>结果</td>
              <td>
                <span>
                  <input id="resultSuccess" type="radio" name="resultType" value="success" checked={this.state.result === "success"} onChange={this.setResult} disabled={isFixedResult} /><label htmlFor="resultSuccess">成功</label>&emsp;
                  <input id="resultFailure" type="radio" name="resultType" value="failure" checked={this.state.result === "failure"} onChange={this.setResult} disabled={isFixedResult} /><label htmlFor="resultFailure">失败</label>&emsp;
                  <input id="resultNA" type="radio" name="resultType" value="NA" checked={this.state.result === "NA"} onChange={this.setResult} disabled={isFixedResult} /><label htmlFor="resultNA">NA</label>
                </span>
              </td>
            </tr>
          </tbody>
        </Table>;
    } 

    return (
      <div className="RecordDetailTable">
        <Table bordered condensed hover>
          <colgroup>
            <col className="FootballStat-actionRecorderDetail-item" />
            <col className="FootballStat-actionRecorderDetail-value" />
          </colgroup>
          <tbody>
            <tr>
              <td>球队</td>
              <td>
                <span className="FootballStat-select">
                  <input id="teamHost" type="radio" name="teamSelection" value="host" checked={this.props.team === "host"} onChange={this.setTeam} /><label htmlFor="teamHost">主队</label>&emsp;
                  <input id="teamGuest" type="radio" name="teamSelection" value="guest" checked={this.props.team === "guest"} onChange={this.setTeam} /><label htmlFor="teamGuest">客队</label>
                </span>
                <Button className="FootballStat-actionDetail-teamSelect" onClick={this.switchTeam} bsSize="xsmall">切换(I)</Button>
              </td>
            </tr>
            <tr>
              <td>动作</td>
              <td>
                <select className="FootballStat-select" ref={"actionSelect"} value={this.props.action} onChange={this.selectAction}>
                  {actions.map((action) => <option key={action.value.toString()} value={action.value}>{action.tag}</option>)}
                </select>
              </td>
            </tr>
          </tbody>
        </Table>
        {basic}
        {opponentRecord}
        <Button ref="addRecButton" bsStyle="success" onClick={this.handleAddRec}  block>添加记录(M)</Button>
        <div className="FootballStat-warning">
          {this.props.warningMsg}
        </div>
      </div>
    );
  }
  
  componentWillReceiveProps(nextProps) {
    var nextDefaultResult = this.getResultPerAction(nextProps.action);
    if (nextProps.action !== this.props.action)
    {
      this.setState({
        fromPlayer: "NA",
        toPlayer: "NA",
        opponentPlayer: "NA",
        result: nextDefaultResult,
        specificKey1: "NA",
        specificVal1: "NA",
        specificKey2: "NA",
        specificVal2: "NA",
        specificKey3: "NA",
        specificVal3: "NA",
        opponentRecord: false,
        opponentAction: "NA",
        opponentFromPlayer: "NA",
        opponentToPlyaer: "NA",
        opponentActionResult: "NA",
        opponentActionSpecificKey1: "NA",
        opponentActionSpecificVal1: "NA",
        opponentActionSpecificKey2: "NA",
        opponentActionSpecificVal2: "NA",
        opponentActionSpecificKey3: "NA",
        opponentActionSpecificVal3: "NA",
      });
      
      if (this.refs.fromPlayer && nextProps.action !== "") {
        this.refs.fromPlayer.focus();
      }
      
      this.props.setWarning(null);
    }
  }
}

class EditRecorderDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      id: this.props.record.id,
      operation: this.props.record.operation,
      time: this.props.record.time,
      from: this.props.record.from,
      to: this.props.record.to,
      opponent: this.props.record.opponent,
      result: this.props.record.result,
      team: this.props.record.team,
      action: this.props.record.action,
      specificKey1: this.props.record.specificKey1,
      specificVal1: this.props.record.specificVal1,
      specificKey2: this.props.record.specificKey2,
      specificVal2: this.props.record.specificVal2,
      specificKey3: this.props.record.specificKey3,
      specificVal3: this.props.record.specificVal3,
    });
    this.handleSaveRec = this.handleSaveRec.bind(this);
    this.handleDelRec = this.handleDelRec.bind(this);
    this.selectAction = this.selectAction.bind(this);
    this.setTeam = this.setTeam.bind(this);
    this.switchTeam = this.switchTeam.bind(this);
    this.setResult = this.setResult.bind(this);
    this.setSpecificProp = this.setSpecificProp.bind(this);
    this.setFrom = this.setFrom.bind(this);
    this.setTo = this.setTo.bind(this);
    this.selectOpponentPlayer = this.selectOpponentPlayer.bind(this);
  }
  
  handleSaveRec() {
    var record = this.props.record;
    record.team = this.state.team;
    record.from = this.state.from;
    record.to = this.state.to;
    record.opponent = this.state.opponent;
    record.result = this.state.result;
    record.action = this.state.action;
    record[this.state.specificKey1] = this.state.specificVal1;
    record[this.state.specificKey2] = this.state.specificVal2;
    record[this.state.specificKey3] = this.state.specificVal3;
    this.props.submit(record);
  }
  
  handleDelRec() {
    var record = this.props.record;
    this.props.delete(record);
  }

  setFrom(e)  {
     this.setState({
      from: e.target.value
    });    
  }

  setTo(e)  {
     this.setState({
      to: e.target.value
    });    
  }  

  setResult(e) {
    this.setState({
      result: e.target.value
    });
  }
  
  setTeam(e) {
    this.setState({
      team: e.target.value
    });
  }
  
  switchTeam() {
    var temp_team = this.state.team === "host" ? "guest" : "host";
    this.setState({
      team: temp_team
    });
  }
  
  getResultPerAction(action) {
    var result = "success";
    switch (action) {
      case "offside":
      case "owngoal":
      case "free":
      case "corner":
      case "foul":
      case "yellow":
      case "red":
        result = "NA";
        break;
      default:
        break;
    } 
    return result;
  }
  
  selectAction(e) {
    this.setState({
      action: e.target.value,
      result: this.getResultPerAction(e.target.value)
    });
  }

  setSpecificProp(specific) {
    switch (specific.id)
    {
      case 1:
        this.setState({
          specificKey1: specific.key,
          specificVal1: specific.value
        })
        break;
      case 2:
        this.setState({
          specificKey2: specific.key,
          specificVal2: specific.value
        })
        break;
      case 3:
        this.setState({
          specificKey3: specific.key,
          specificVal3: specific.value
        })
        break;
      default:
        //do nothing;
    }
  }
  
  selectOpponentPlayer(player) {
    this.setState({
      opponent: player
    });
  }
  
  render() {
    var isSinglePlayerAction = false;
    var isFixedResult = false;
    var specific, originalRecord, toPlayer;

    switch (this.state.action) {
      case "dribble":
      case "shoot":
      case "offside":
      case "tackle":
      case "interception":
      case "block":
      case "clearance":
      case "save":
      case "owngoal":
      case "free":
      case "corner":
      case "penalty":
      case "foul":
      case "yellow":
      case "red":
        isSinglePlayerAction = true;
        break;
      default:
        isSinglePlayerAction = false;
        break;
    }
    
    if (isSinglePlayerAction === false) {
      toPlayer = 
        <span> => <select className="FootballStat-select" value={this.state.to} onChange={this.setTo} >
          {numbers.map((number) => <option key={number.toString()} value={number}>{number}</option>)}
        </select>号</span>;
    } else {
      toPlayer = null;
    }

    if (this.props.record.action === this.state.action) {
      // action not changed
      switch (this.state.action) {
        case "pass":
        case "through":
        case "cross":
        case "assist":
        case "shoot":
        case "tackle":
        case "free":
        case "corner":
        case "foul":
        case "yellow":
        case "red":
          originalRecord = this.props.record;
          break;
        default:
          originalRecord = null;
      }
    } else {
      originalRecord = null;
    }

    switch (this.state.action) {
      case "assist":
      case "offside":
      case "owngoal":
      case "free":
      case "corner":
      case "foul":
      case "yellow":
      case "red":
        isFixedResult = true;
        break;
      default:
        isFixedResult = false;
        break;
    }
    
    switch (this.state.action)
    {
      case "":
        specific = null;
        break;
      case "pass":
        specific = <ActionPass setSpecificProp={this.setSpecificProp} originalRecord={originalRecord} />
        break;
      case "through":
        specific = <ActionThroughOrCross setSpecificProp={this.setSpecificProp} originalRecord={originalRecord} />
        break;
      case "cross":
        specific = <ActionThroughOrCross setSpecificProp={this.setSpecificProp} originalRecord={originalRecord} />
        break;
      case "dribble":
        specific = <ActionCommon />;
        break;
      case "assist":
        specific = <ActionAssist setSpecificProp={this.setSpecificProp} originalRecord={originalRecord} />
        break;
      case "shoot":
        specific = <ActionShoot setSpecificProp={this.setSpecificProp} originalRecord={originalRecord} />
        break;
      case "offside":
        specific = <ActionCommon />
        break;
      case "tackle":
        specific = <ActionTackle setSpecificProp={this.setSpecificProp} originalRecord={originalRecord} />
        break;
      case "interception":
        specific = <ActionCommon />
        break;
      case "block":
        specific = <ActionCommon />
        break;
      case "clearance":
        specific = <ActionCommon />
        break;
      case "save":
        specific = <ActionCommon />
        break;
      case "owngoal":
        specific = <ActionCommon />
        break;
      case "free":
        specific = <ActionFree setSpecificProp={this.setSpecificProp} originalRecord={originalRecord} />
        break;
      case "corner":
        specific = <ActionCorner setSpecificProp={this.setSpecificProp} originalRecord={originalRecord} />
        break;
      case "penalty":
        specific = <ActionCommon />
        break;
      case "foul":
        specific = <ActionFoulsOrYellowOrRed selectOpponentPlayer={this.selectOpponentPlayer} originalRecord={originalRecord} />
        break;
      case "yellow":
        specific = <ActionFoulsOrYellowOrRed selectOpponentPlayer={this.selectOpponentPlayer} originalRecord={originalRecord} />
        break;
      case "red":
        specific = <ActionFoulsOrYellowOrRed selectOpponentPlayer={this.selectOpponentPlayer} originalRecord={originalRecord} />
        break;
      default:
        specific = null;
        break;
    }
    
    return (
      <div>
        <Table bordered condensed hover>
          <colgroup>
            <col className="FootballStat-actionRecorderDetail-item" />
            <col className="FootballStat-actionRecorderDetail-value" />
          </colgroup>
          <tbody>
            <tr>
              <td>Record ID</td>
              <td>{this.props.record.id}</td>
            </tr>
            <tr>
              <td>球队</td>
              <td>
                <span className="FootballStat-select">
                  <input id="teamHostDialog" type="radio" name="teamSelectionDialog" value="host" checked={this.state.team === "host"} onChange={this.setTeam} /><label htmlFor="teamHostDialog">主队</label>&emsp;
                  <input id="teamGuestDialog" type="radio" name="teamSelectionDialog" value="guest" checked={this.state.team === "guest"} onChange={this.setTeam} /><label htmlFor="teamGuestDialog">客队</label>
                </span>
              </td>
            </tr>
            <tr>
              <td>动作</td>
              <td>
                <select className="FootballStat-select" value={this.state.action} onChange={this.selectAction}>
                  {actions.map((act) => <option key={act.value.toString()} value={act.value}>{act.tag}</option>)}
                </select>
              </td>
            </tr>
            <tr>
              <td>时间</td>
              <td>
                <DurationDate miniseconds={this.props.record.time} />
              </td>
            </tr>
            <tr>
              <td>球员</td>
              <td>
                <select className="FootballStat-select" ref="fromPlayer" defaultValue={this.state.from} onClick={this.setFrom}>
                  {numbers.map((number) => <option key={number.toString()} value={number}>{number}</option>)}
                </select>
                <span>号</span>
                {toPlayer}
              </td>
            </tr>
          </tbody>
          {specific}
          <tbody>
            <tr>
              <td>结果</td>
              <td>
                <span>
                  <input id="resultSuccessDialog" type="radio" value="success" checked={this.state.result === "success"} onChange={this.setResult} disabled={isFixedResult} /><label  htmlFor="resultSuccessDialog">成功</label>&emsp;
                  <input id="resultFailureDialog" type="radio" value="failure" checked={this.state.result === "failure"} onChange={this.setResult} disabled={isFixedResult} /><label  htmlFor="resultFailureDialog">失败</label>&emsp;
                  <input id="resultNADialog" type="radio" value="NA" checked={this.state.result === "NA"} onChange={this.setResult} disabled={isFixedResult} /><label htmlFor="resultFailureDialog">NA</label>
                </span>
              </td>
            </tr>
          </tbody>
        </Table>
        <ButtonToolbar>
          <Button ref="saveRecButton" bsStyle="success" onClick={this.handleSaveRec}>保存记录</Button>
          <Button ref="delRecButton" bsStyle="danger" onClick={this.handleDelRec}>删除记录</Button>
        </ButtonToolbar>
        <div className="FootballStat-warning">{this.props.warningMsg}</div>
      </div>
    );
  }
}

class RecordItem extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick(e) {
    this.props.openDialog(e.currentTarget.id);
  }
  
  render() {
    var tempClass;
    if (this.props.recordItem.result === "success") {
      tempClass = "RecordSuccess";
    } else if (this.props.recordItem.result === "failure") {
      tempClass = "RecordFailure";
    } else {
      tempClass = "RecordNA";
    }
    
    return (
      <tr id={this.props.recordItem.id} className={tempClass} onClick={this.handleItemClick}>
        <td>
          {this.props.recordItem.id} 
        </td>
        <td>
          <DurationDate miniseconds={this.props.recordItem.time} />
        </td>
        <td>
          {this.props.recordItem.team}
        </td> 
        <td>
          {this.props.recordItem.action}
        </td>
        <td>
          {this.props.recordItem.from}
        </td>
        <td>
          {this.props.recordItem.to}
        </td>
      </tr>
    );
  }
}

class RecordList extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      showModal:false,
      selectItem:[2]
    });
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.getIndexFromRecord = this.getIndexFromRecord.bind(this);
    this.submitModifyRecord = this.submitModifyRecord.bind(this);
    this.delRecord = this.delRecord.bind(this);
/*  this.sortUp = this.sortUp.bind(this);
    this.sortDown = this.sortDown.bind(this);
    this.reverseRecord = this.reverseRecord.bind(this);
*/
    this.getTimeSeconds = this.getTimeSeconds.bind(this);
  }
  
  getIndexFromRecord(id) {
    var tempRECORDS = this.props.records;
    var i = 0;
    for (i = 0; i < tempRECORDS.length; i++){
      if(tempRECORDS[i].id === id) {
        return i;
      }
    }
  }
  
  delRecord(record) {
    var tempRECORDS = this.props.records;
    var index;
    var sRecord = {};
    sRecord["id"] = record["id"];
    sRecord["operation"] = "delete";    
    var result = this.props.sendRecord(JSON.stringify(sRecord));
    
    // comment out below code for local debug
    if (result === false) return;
    
    index = this.getIndexFromRecord(record.id);
    tempRECORDS.splice(index, 1);
    this.props.setRec(tempRECORDS);
    this.closeDialog();
  }

  getTimeSeconds(Str) {
    var Temp = Str.split(':');
    var Seconds = 3600 * Number(Temp[0]) + 60 * Number(Temp[1]) + Number(Temp[2]);
    return(Seconds);     
  }

/*  sortUp() {
    var tempRECORDS = this.props.records;   
    tempRECORDS.sort( (a,b)=> {
      return (this.getTimeSeconds(a.time) - this.getTimeSeconds(b.time));
    });
    this.props.setRec(tempRECORDS);
  }

  sortDown() {
    var tempRECORDS = this.props.records;   
    tempRECORDS.sort( (a,b)=> {
      return (this.getTimeSeconds(b.time) - this.getTimeSeconds(a.time));
    });
    this.props.setRec(tempRECORDS);
  }

  reverseRecord() {
    var tempRECORDS = this.props.records;
    tempRECORDS.reverse().join();
    this.props.setRec(tempRECORDS);      
  }
*/  
  submitModifyRecord(record) {
    var tempRECORDS = this.props.records;
    var index = this.getIndexFromRecord(record.id);
    var sRecord = JSON.parse(JSON.stringify(record));  
    sRecord["operation"] = "modify";
    
    var result = this.props.sendRecord(JSON.stringify(sRecord));
    // comment out below code for local debug
    if (result === false) return;
    
    tempRECORDS.splice(index, 1, record);
    this.props.setRec(tempRECORDS);
    this.closeDialog();
  }
  
  closeDialog() {
    this.setState({
      showModal: false
    });
    this.props.setWarning(null);
  }

  openDialog(id) {
    //get one selected item from RECORD .
    this.setState({
        selectItem : this.props.records.filter((x) => { return (x.id === Number(id)); })[0]
    });
    this.setState({ showModal: true });
    this.props.setWarning(null);
  }

  render() {
    var tempRec = this.props.records.slice(0);
    tempRec.sort( (a,b)=> {
      return (b.time) - (a.time);
    });
    var tempItem = this.state.selectItem;
    return (
      <div className="FootballStat-recordList">
        <div className="FootballStat-recordList-pannel">
          <div className="FootballStat-recordList-title TableHeader">点击动作条目以编辑</div>
          <div className="FootballStat-recordList-header">
            <Table bordered condensed className="specialMargin">
              <colgroup>
                <col className="FootballStat-recordList-data-id" />
                <col className="FootballStat-recordList-data-time" />
                <col className="FootballStat-recordList-data-team" />
                <col className="FootballStat-recordList-data-action" />
                <col className="FootballStat-recordList-data-from" />
                <col className="FootballStat-recordList-data-to" />
              </colgroup>
              <tbody>
                <tr>
                  <th>ID</th>
                  <th>Time</th>
                  <th>Team</th>
                  <th>Action</th>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </tbody>
            </Table>
          </div>
          <div className="FootballStat-recordList-data">
            <Table bordered condensed hover>
              <colgroup>
                <col className="FootballStat-recordList-data-id" />
                <col className="FootballStat-recordList-data-time" />
                <col className="FootballStat-recordList-data-team" />
                <col className="FootballStat-recordList-data-action" />
                <col className="FootballStat-recordList-data-from" />
                <col className="FootballStat-recordList-data-to" />
              </colgroup>
              <tbody>
                  {tempRec.map((item) => <RecordItem key={item.id} recordItem={item} openDialog={this.openDialog}/>)}
              </tbody>
            </Table>
          </div>
        </div>
        <div>
          <Modal show={this.state.showModal} onHide={this.closeDialog}>
            <Modal.Header closeButton>
              <Modal.Title>编辑记录</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="FootballStat-editActionDetail">
                <EditRecorderDetail ref="recorder0" 
                  record={tempItem}
                  addRec={this.addRec}
                  submit={this.submitModifyRecord}
                  delete={this.delRecord}
                  warningMsg={this.props.warningMsg}
                />  
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.closeDialog}>关闭</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }
}

class RecordSingleTeamItem extends React.Component {
  render() {
    return (
      <tr>
        <td>
          {this.props.recordItem.tag}
        </td>
        <td>
          {this.props.recordItem.success}
        </td> 
        <td>
          {this.props.recordItem.failure}
        </td>
        <td>
          {this.props.recordItem.NA}
        </td>
      </tr>
    );
  }
}

class SingleTeamStat extends React.Component {
  render() {
    var teamTitle = this.props.team === "host" ? "主队" : "客队";
    var tempRec = this.props.records;
    var countAction =  {
      pass          : {action: "pass", tag: "传球", success: 0, failure: 0, NA: 0},
      through       : {action: "through", tag: "直塞", success: 0, failure: 0, NA: 0},
      cross         : {action: "cross",  tag: "传中", success: 0, failure: 0, NA: 0},
      dribble       : {action: "dribble", tag: "过人", success: 0, failure: 0, NA: 0},
      assist        : {action: "assist", tag: "助攻", success: 0, failure: 0, NA: 0},
      shoot         : {action: "shoot", tag: "射门", success: 0, failure: 0, NA: 0},
      offside       : {action: "offside", tag: "越位", success: 0, failure: 0, NA: 0},
      tackle        : {action: "tackle", tag: "抢断", success: 0, failure: 0, NA: 0},
      interception  : {action: "interception", tag: "截断", success: 0,failure: 0, NA: 0},
      block         : {action: "block", tag: "阻挡", success: 0, failure: 0, NA: 0},
      clearance     : {action: "clearance", tag: "解围", success: 0, failure: 0, NA: 0},
      save          : {action: "save", tag: "扑救", success: 0, failure: 0, NA: 0},
      owngoal       : {action: "owngoal", tag: "乌龙", success: 0, failure: 0, NA: 0},
      free          : {action: "free", tag: "任意", success: 0, failure: 0, NA: 0},
      corner        : {action: "corner", tag: "角球", success: 0, failure: 0, NA: 0},
      penalty       : {action: "penalty", tag: "点球", success: 0, failure: 0, NA: 0},
      foul          : {action: "foul", tag: "犯规", success: 0, failure: 0, NA: 0},
      yellow        : {action: "yellow", tag: "黄牌", success: 0, failure: 0, NA: 0},
      red           : {action: "red", tag: "红牌", success: 0, failure: 0, NA: 0}
    }; 

    for (var i = 0; i < tempRec.length; i++) {
        if (tempRec[i].team === this.props.team) {
          if (tempRec[i].result === "success")
            countAction[tempRec[i].action].success++;
          else if (tempRec[i].result === "failure")
            countAction[tempRec[i].action].failure++;
          else 
            countAction[tempRec[i].action].NA++;
        }
    };
    
    var rows = [];

    for (var item in countAction) {
      if (countAction.hasOwnProperty(item)) {
        rows.push(countAction[item.toString()]);
      }
    }
    
    return (
      <div>
        <div className="FootballStat-teamStat-header TableHeader">{teamTitle}</div>
        <Table className="FootballStat-teamStat-data" bordered condensed hover>
          <colgroup>
            <col className="FootballStat-teamStat-data-action" />
            <col className="FootballStat-teamStat-data-success" />
            <col className="FootballStat-teamStat-data-failure" />
            <col className="FootballStat-teamStat-data-NA" />
          </colgroup>
          <thead>
            <tr>
              <th>动作</th>
              <th>成功</th>
              <th>失败</th>
              <th>NA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => <RecordSingleTeamItem key={item.action.toString()} recordItem={item} />)}
          </tbody>
        </Table>
      </div>
    );
  }
}

class TeamStat extends React.Component {
  render() {
    return (
      <div className="FootballStat-teamStat" >
        <div className="FootballStat-teamStat-pannel">
          <div className="FootballStat-teamStat-home">
            <SingleTeamStat records={this.props.records} team={"host"} />
          </div>
          <div className="FootballStat-teamStat-guest">
            <SingleTeamStat records={this.props.records} team={"guest"} />
          </div>
        </div>
      </div>
    );
  }
}

const keyMap = {
  "playPause"     : "p",
  "switchTeam"    : "i",
  "pass"          : "q",
  "through"       : "w",
  "cross"         : "e",
  "dribble"       : "r",
  "assist"        : "t",
  "shoot"         : "y",
  "offside"       : "u",
  "tackle"        : "a",
  "interception"  : "s",
  "block"         : "d",
  "clearance"     : "f",
  "save"          : "g",
  "owngoal"       : "h",
  "free"          : "z",
  "corner"        : "x",
  "penalty"       : "c",
  "foul"          : "v",
  "yellow"        : "b",
  "red"           : "n",
  "addRecord"     : "m"
};

class FootballStat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      team: "host",
      currentAction : "",
      playTime: 0,
      playing: true,
      startTime: 0,
      RECORDS: [
        {"id": 1, "operation":"ADD","time": 1507569200265, "team": "host", "action": "pass", "from": 1, "to" : 2,"result":"success", method: "head", threat: false, type: "short"}],
      warningMsg: false
    };
    
    this.selectAction = this.selectAction.bind(this);
    this.setPlayTime = this.setPlayTime.bind(this);
    this.pausePlaying = this.pausePlaying.bind(this);
    this.resumePlaying = this.resumePlaying.bind(this);
    this.setTeam = this.setTeam.bind(this);
    this.addRec = this.addRec.bind(this);
    this.setRec = this.setRec.bind(this);
    this.setStartTime = this.setStartTime.bind(this);
    this.sendRecord = this.sendRecord.bind(this);
    this.setWarning = this.setWarning.bind(this);
  }

  selectAction(actionSelected) {
    this.setState({
      currentAction: actionSelected,
      //playing: false
    });
    this.refs.videoPlayer.setPlayTime();
  }
  
  pausePlaying() {
    this.setState({
      playing: false
    });
  }
  
  resumePlaying() {
    this.setState({
      playing: true
    });
  }

  setPlayTime(playTimeInMiniseconds) {
    this.setState({
      playTime: playTimeInMiniseconds
    });
  }

  setStartTime(vl) {
    this.setState({
      startTime: vl
    });
  }
  
  setTeam(team) {
    this.setState({
      team: team
    });
  }
  
  sendRecord(record)
  {
    var xmlhttp;
    var result;
    xmlhttp=new XMLHttpRequest();
    this.setState({
      warningMsg: "正在连接服务器..."
    })
    var tempRecord = JSON.parse(record);
    
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200 )
      {
        this.setState({
          warningMsg: null
        });
        result = true;
      } else {
        if (xmlhttp.readyState === 0 || xmlhttp.readyState === 1 || xmlhttp.readyState === 2 || xmlhttp.readyState === 3) {
          this.setState({
            warningMsg: "正在连接服务器..."
          });
        } else { 
          // xmlhttp.readyState == 4 && xmlhttp.status== 404
          if (tempRecord.operation === "add") {
            this.setState({
              warningMsg: "无法连接到服务器，请重新添加"
            });
          } else {
            this.setState({
              warningMsg: "无法连接到服务器，请重新保存/删除"
            });
          }
        }
        result = false;
      }
    }

    xmlhttp.open("POST","./test.php", false);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send(record);
    return result;
  }

  addRec(record) {
    var tempRECORDS = this.state.RECORDS;
    var length = tempRECORDS.length;
    var result;
    
    // push record to server
    var sRecord = JSON.parse(JSON.stringify(record));  
    sRecord["operation"] = "add"; 
    result = this.sendRecord(JSON.stringify(sRecord));
    
    // comment out below code for local debug
    //if (result === false) return false;
    
    record.id = length > 0 ? tempRECORDS[length - 1].id + 1 : 1;
    tempRECORDS.push(record);
    this.setState({
      RECORDS: tempRECORDS
    });
    
    return true;
  }
  
  setRec(records) {
    this.setState({
      RECORDS: records
    }); 
  }
  
  setWarning(warning) {
    this.setState({
      warningMsg: warning
    });
  } 
  
  render() {
    const handlers = {
      "playPause"     : (event) => this.state.playing === true ? this.pausePlaying() : this.resumePlaying(),
      "switchTeam"    : (event) => this.setTeam(this.state.team === "host" ? "guest" : "host"),
      "pass"          : (event) => this.selectAction("pass"),
      "through"       : (event) => this.selectAction("through"),
      "cross"         : (event) => this.selectAction("cross"),
      "dribble"       : (event) => this.selectAction("dribble"),
      "assist"        : (event) => this.selectAction("assist"),
      "shoot"         : (event) => this.selectAction("shoot"),
      "offside"       : (event) => this.selectAction("offside"),
      "tackle"        : (event) => this.selectAction("tackle"),
      "interception"  : (event) => this.selectAction("interception"),
      "block"         : (event) => this.selectAction("block"),
      "clearance"     : (event) => this.selectAction("clearance"),
      "save"          : (event) => this.selectAction("save"),
      "owngoal"       : (event) => this.selectAction("owngoal"),
      "free"          : (event) => this.selectAction("free"),
      "corner"        : (event) => this.selectAction("corner"),
      "penalty"       : (event) => this.selectAction("penalty"),
      "foul"          : (event) => this.selectAction("foul"),
      "yellow"        : (event) => this.selectAction("yellow"),
      "red"           : (event) => this.selectAction("red"),
      "addRecord"     : (event) => this.refs.recorder.handleAddRec()
    };
    
    return (
      <HotKeys className="FootballStat" keyMap={keyMap} handlers={handlers}>
        <div className="FootballStat-header">
          <div className="FootballStat-header-column">
            <img src={logo} className="FootballStat-logo" alt="logo" />
            <span className="FootballStat-welcome">Welcome to FootballStat</span>
          </div>
        </div>
        <div className="FootballStat-column">
          <div className="FootballStat-video-stat-list">
            <VideoPlayer ref="videoPlayer" playing={this.state.playing} startTime={this.state.startTime} setStartTime={this.setStartTime} setPlayTime={this.setPlayTime} pausePlaying={this.pausePlaying} resumePlaying={this.resumePlaying} />
            <TeamStat records={this.state.RECORDS} />
            <RecordList sendRecord={this.sendRecord} records={this.state.RECORDS} setRec={this.setRec} warningMsg={this.state.warningMsg} setWarning={this.setWarning} />
          </div>
          <div className="FootballStat-actionRecord" >
            <ActionButtonGroup selectAction={this.selectAction} />
            <div className="FootballStat-actionDetail">
              <ActionRecorderDetail ref="recorder"
                selectAction={this.selectAction}
                action={this.state.currentAction}
                time={this.state.playTime}
                team={this.state.team}
                setTeam={this.setTeam} 
                addRec={this.addRec}
                resumePlaying={this.resumePlaying}
                warningMsg={this.state.warningMsg} 
                setWarning={this.setWarning} />
            </div>
          </div>
        </div>
      </HotKeys>
    );
  }
}

export default FootballStat;
