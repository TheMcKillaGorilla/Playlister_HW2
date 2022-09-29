import React from "react";
import ListCard from "./ListCard";

export default class SidebarList extends React.Component {
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    } 

    render() {
        const { currentList,
                keyNamePairs,
                deleteListCallback, 
                loadListCallback,
                renameListCallback} = this.props;

            let a = keyNamePairs;
            this.sortKeyNamePairsByName(a);

        return (
            <div id="sidebar-list">
                {
                    a.map((pair) => (
                        <ListCard
                            key={pair.key}
                            keyNamePair={pair}
                            selected={(currentList !== null) && (currentList.key === pair.key)}
                            deleteListCallback={deleteListCallback}
                            loadListCallback={loadListCallback}
                            renameListCallback={renameListCallback}
                        />
                    ))
                }
            </div>
        );
    }
}