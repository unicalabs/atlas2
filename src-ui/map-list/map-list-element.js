/*jshint esversion: 6 */

import React from 'react';
import {
  Grid,
  Row,
  Col,
  Table,
  ListGroup,
  ListGroupItem,
  Glyphicon,
  DropdownButton,
  MenuItem
} from 'react-bootstrap';
var LinkContainer = require('react-router-bootstrap').LinkContainer;
import SingleWorkspaceActions from './single-workspace-actions';
import {calculateMapName} from './map-name-calculator';
import $ from 'jquery';

export default class MapListElement extends React.Component {

  constructor(props) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.computeSubmapReferencesMessage = this.computeSubmapReferencesMessage.bind(this);
    this.stopPropagation = this.stopPropagation.bind(this);
  }

  delete(id) {
    SingleWorkspaceActions.deleteMap({mapID : id});
  }

  componentDidMount() {
    var mapID = this.props.id;

    $.ajax({
      type: 'GET',
      url: '/api/submap/' + mapID + '/usage',
      success: function(referencingMaps) {
        this.setState({referencingMaps: referencingMaps});
      }.bind(this)
    });
  }

  stopPropagation(event){
    event.stopPropagation();
    event.preventDefault();
  }

  computeSubmapReferencesMessage() {
    if (!this.state || !this.state.referencingMaps) {
      return null;
    }
    if (this.state.referencingMaps.length === 0) {
      return <div>No other map uses this submap. It&#39;s undesired.</div>;
    }
    var mapsList = [];
    for (var i = 0; i < this.state.referencingMaps.length; i++) {
      var href = '/map/' + this.state.referencingMaps[i]._id;
      var name = calculateMapName('Unknown', this.state.referencingMaps[i].user, this.state.referencingMaps[i].purpose, this.state.referencingMaps[i].name);
      var punctuation = ', ';
      if (i === this.state.referencingMaps.length - 1) {
        punctuation = null;
      }
      if (i === this.state.referencingMaps.length - 2) {
        punctuation = ' and ';
      }
      mapsList.push(
        <span key={href}>&#39;<a href={href}>{name}</a>&#39;{punctuation}</span>
      );
    }
    return (
      <div>Maps {mapsList}
        use this submap.</div>
    );
  }
  render() {
    var mapid = this.props.id;
    var workspaceID = this.props.workspaceID;
    var href = '/map/' + mapid;
    var mapName = calculateMapName("I like being lost.", this.props.user, this.props.purpose, this.props.name);

    var deleteButton = (
      <MenuItem eventKey="1" onClick={this.delete.bind(this, mapid)}><Glyphicon glyph="remove"></Glyphicon>Delete</MenuItem>
    );
    var mapsUsingThisSubmapInfo = null;
    if (this.props.isSubmap) {
      mapsUsingThisSubmapInfo = this.computeSubmapReferencesMessage();
    }
    var responsible = null;
    if(this.props.responsible) {
      responsible = (<span><Glyphicon glyph="user"></Glyphicon> {this.props.responsible}</span>);
    }
    var dropDownTitle = <Glyphicon glyph="cog"></Glyphicon>;
    return (
      <LinkContainer to={{ pathname: href }}>
        <ListGroupItem header={mapName} href={href}>
          <Grid fluid={true}>
            <Row className="show-grid">
              <Col xs={11}>{mapsUsingThisSubmapInfo}{responsible}</Col>
              <Col xs={1}>
                <DropdownButton title={dropDownTitle} onClick={this.stopPropagation}>
                  {deleteButton}
                </DropdownButton>
              </Col>
            </Row>
          </Grid>
        </ListGroupItem>
      </LinkContainer>
    );
  }
}
