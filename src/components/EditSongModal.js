import React, { Component } from 'react';

export default class EditSongModal extends Component {

    handleClick = (event) => {
        let a = document.getElementById('t').value;
        let b = document.getElementById('a').value;
        let c = document.getElementById('y').value;

        document.getElementById('t').value = null ;
        document.getElementById('a').value = null;
        document.getElementById('y').value = null;

        this.props.editSongCallback({
            "title": a,
            "artist": b,
            "youTubeId": c
        });
        
    }
    
    render() {
        const { song, hideEditSongModalCallback } = this.props;

        return (
            <div class="modal" id="edit-song-modal" data-animation="slideInOutLeft">
            <div class="modal-root" id='verify-delete-list-root'>
                <div class="modal-north">
                    Edit Song
                </div>                
                <div class="modal-center-content-a">
                    <div class="modal-a">
                        
                        <div class="modal-i"> Title: </div>    
                        
                        <input type="text" id = 't'   defaultValue = {song==null?null:song.title} onChange ={e => this.setState({t: e.target.value})}/>
                    </div>

                    <div>
                        <label class="modal-i">
                            Artist:
                        </label>
                        <input type="text" id = 'a' class="modal-i" defaultValue = {song==null?null:song.artist} onChange ={e => this.setState({a: e.target.value})}/>
                    </div>
                      
                    <div>
                        <label>
                            YuTubeId:
                        </label>
                        <input type="text" id = 'y' class="modal-i" defaultValue = {song==null?null:song.youTubeId} onChange ={e => this.setState({y: e.target.value})}/>
                    </div>
                </div>

                <div class="modal-south">
                    <input type="button" id="edit-list-confirm-button" class="modal-button" 
                    onClick={this.handleClick} 
                    value='Confirm' />
                    <input type="button" id="edit-list-cancel-button" class="modal-button" onClick={hideEditSongModalCallback} value='Cancel' />
                </div>
            </div>
        </div>
        );
    }
}
