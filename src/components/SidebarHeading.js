import React from "react";

export default class SidebarHeading extends React.Component {
    
    
    render() {
        const { createNewListCallback, canAddList } = this.props;
        let addListClass = "toolbar-button";
        if(!canAddList) addListClass +="-disabled";
        return (
            <div id="sidebar-heading">
                <input 
                    type="button" 
                    id="add-list-button" 
                    className={addListClass}
                    onClick={createNewListCallback}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}