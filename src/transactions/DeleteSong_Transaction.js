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
 export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, i,s) {
        super();
        this.app = initModel;
        this.id = i;
        this.song = s;
    }

    doTransaction() {
        this.app.deleteSong(this.song);
    }
    
    undoTransaction() {
        this.app.undoDeleteSong(this.song,this.id);
    }
}