import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';
import EditedSong_Transaction from './transactions/EditedSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import DeleteSongModal from './components/DeleteSongModal.js';
import EditSongModal from './components/EditSongModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.props = props

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            songMarkedForDeletion: null,
            songMarkedForDeletionid: null
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    addSong = (newSong) => {
        let cu = this.state.currentList
        
        cu.songs.push(newSong);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: cu,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: prevState.sessionData.keyNamePairs
            },
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    undoDeleteSong = (song,id) => {
        let cu = this.state.currentList
        
        let newSong =song;
        let s = [];

        for(let i=0;i<cu.songs.length;i++){
            if(i === id){
                s.push(newSong);
            }
            s.push(cu.songs[i]);
        }
        if(id === cu.songs.length){
            s.push(newSong);
        }
        cu.songs = s;
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: cu,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: prevState.sessionData.keyNamePairs
            },
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
            this.closeCurrentList();
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            },
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT

            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    
    deleteSong = (key) => {

        let keyIndex = this.state.currentList.songs.findIndex((song) => {
            return (song === key);
        });
        let cu = this.state.currentList;
        let newKeyNamePairs = cu.songs;
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            songMarkedForDeletion: null
        }), () => {
            this.db.mutationUpdateList(cu);
        });
    }

    undoAddsong = (id) => {

        let cu = this.state.currentList;
        let newKeyNamePairs = cu.songs;
        if (id >= 0)
            newKeyNamePairs.splice(id, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            songMarkedForDeletion: null
        }), () => {
            this.db.mutationUpdateList(cu);
        });
    }

    editSong = (key,song) => {

        let keyIndex = this.state.currentList.songs.findIndex((song) => {
            return (song === key);
        });
        let cu = this.state.currentList;
        let newKeyNamePairs = cu.songs;
        if (keyIndex >= 0)
            newKeyNamePairs[keyIndex] = song;

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            songMarkedForDeletion: null
        }), () => {
            this.db.mutationUpdateList(cu);
        });
    }
    deleteMarkedList = () => {
        this.hideDeleteListModal();
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
    }
    deleteMarkedSong = () => {
        this.hideDeleteSongModal();
        this.deleteSong(this.state.songMarkedForDeletion);
        
    }
    editMarkedSong = (song) => {
        this.hideEditSongModal();
        if(this.state.songMarkedForDeletion !== song) this.editSong(this.state.songMarkedForDeletion, song);
        
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            },
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData,
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            document.getElementById('undo-button').className='toolbar-button-disabled';
            document.getElementById('redo-button').className='toolbar-button-disabled';
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData,
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            document.getElementById('undo-button').className='toolbar-button-disabled';
            document.getElementById('redo-button').className='toolbar-button-disabled';
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData,
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        if(start !== end){
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);}
    }
    addSongTransaction = () => {
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
    }
    deleteSongTransaction = () => {
        this.hideDeleteSongModal();
        let transaction = new DeleteSong_Transaction(this, this.state.songMarkedForDeletionid, this.state.songMarkedForDeletion);
        this.tps.addTransaction(transaction);
    }
    editSongTransaction = (n) => {
        this.hideEditSongModal();
        if(this.state.songMarkedForDeletion.title !== n.title || this.state.songMarkedForDeletion.artist !== n.artist
            || this.state.songMarkedForDeletion.youTubeId !== n.youTubeId){
            let transaction = new EditedSong_Transaction(this, this.state.songMarkedForDeletion,n);
            this.tps.addTransaction(transaction);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData,
            songMarkedForDeletion: prevState.songMarkedForDeletion
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    markSongForDeletion = (id,song) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            songMarkedForDeletion: song,
            songMarkedForDeletionid: id
        }), () => {
            // PROMPT THE USER
            this.showDeleteSongModal();
        });
    }
    markSongForEdition = (song) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            songMarkedForDeletion: song
        }), () => {
            // PROMPT THE USER
            document.getElementById('t').value = song.title ;
            document.getElementById('a').value = song.artist;
            document.getElementById('y').value = song.youTubeId;
            this.showEditSongModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
        document.getElementById('undo-button').className='toolbar-button-disabled';
        document.getElementById('redo-button').className='toolbar-button-disabled';
        document.getElementById('add-song-button').className='toolbar-button-disabled';
        document.getElementById('close-button').className='toolbar-button-disabled';
    }
    showDeleteSongModal() {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
        document.getElementById('undo-button').className='toolbar-button-disabled';
        document.getElementById('redo-button').className='toolbar-button-disabled';
        document.getElementById('add-song-button').className='toolbar-button-disabled';
        document.getElementById('close-button').className='toolbar-button-disabled';
    }
    showEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
        document.getElementById('undo-button').className='toolbar-button-disabled';
        document.getElementById('redo-button').className='toolbar-button-disabled';
        document.getElementById('add-song-button').className='toolbar-button-disabled';
        document.getElementById('close-button').className='toolbar-button-disabled';
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal=() => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        if(this.state.currentList !== null) document.getElementById('add-song-button').className='toolbar-button';
        if(this.state.currentList !== null) document.getElementById('close-button').className='toolbar-button';
        if(this.tps.hasTransactionToUndo()) document.getElementById('undo-button').className='toolbar-button';
        if(this.tps.hasTransactionToRedo()) document.getElementById('redo-button').className='toolbar-button';
    }
    hideDeleteSongModal=() => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        if(this.state.currentList !== null) document.getElementById('add-song-button').className='toolbar-button';
        if(this.state.currentList !== null) document.getElementById('close-button').className='toolbar-button';
        if(this.tps.hasTransactionToUndo()) document.getElementById('undo-button').className='toolbar-button';
        if(this.tps.hasTransactionToRedo()) document.getElementById('redo-button').className='toolbar-button';
    }
    hideEditSongModal=() => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        if(this.state.currentList !== null) document.getElementById('add-song-button').className='toolbar-button';
        if(this.state.currentList !== null) document.getElementById('close-button').className='toolbar-button';
        if(this.tps.hasTransactionToUndo()) document.getElementById('undo-button').className='toolbar-button';
        if(this.tps.hasTransactionToRedo()) document.getElementById('redo-button').className='toolbar-button';
    
    }

    componentDidMount(){
        document.addEventListener('keydown',this.keydownHandler);
    }
    componentWillUnmount(){
        document.removeEventListener('keydown',this.keydownHandler);
    }
    keydownHandler = (e) =>{
        if(e.keyCode===90 && e.ctrlKey) {
            this.undo();
            document.getElementById('redo-button').className='toolbar-button';
            if(!this.tps.hasTransactionToUndo()){
                document.getElementById('undo-button').className='toolbar-button-disabled';
            }
        }
        if(e.keyCode===89 && e.ctrlKey) {
            this.redo();
            document.getElementById('undo-button').className='toolbar-button';
            if(!this.tps.hasTransactionToRedo()){
                document.getElementById('redo-button').className='toolbar-button-disabled';
            }
        }
    }

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        let canAddList = this.state.currentList === null;
        return (
            <div id="root">
                
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canAddList = {canAddList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose}
                    addSongCallback = {this.addSongTransaction}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    deleteListCallback={this.markSongForDeletion}
                    renameListCallback={this.markSongForEdition}
                     />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <DeleteSongModal
                    song={this.state.songMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteSongModal}
                    deleteListCallback={this.deleteSongTransaction}
                />
                <EditSongModal
                    song={this.state.songMarkedForDeletion}
                    hideEditSongModalCallback={this.hideEditSongModal}
                    editSongCallback={this.editSongTransaction}
                />
            </div>
        );
    }
}

export default App;
