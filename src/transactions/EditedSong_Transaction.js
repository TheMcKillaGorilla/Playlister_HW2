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
 export default class EditedSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, o,n) {
        super();
        this.app = initModel;
        this.n = n;
        this.o = o;
    }

    doTransaction() {
        this.app.editSong(this.o,this.n);
    }
    
    undoTransaction() {
        this.app.editSong(this.n,this.o);
    }
}