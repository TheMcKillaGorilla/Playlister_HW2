import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * MoveSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
 export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initModel) {
        super();
        this.app = initModel;
        this.song = {
            "title": "Untitled",
            "artist": "Unknown",
            "youTubeId": "dQw4w9WgXcQ"
        };
        this.id = this.app.state.currentList.songs.length;
    }

    doTransaction() {
        this.app.addSong(this.song);
    }
    
    undoTransaction() {
        this.app.undoAddsong(this.id);
    }
}