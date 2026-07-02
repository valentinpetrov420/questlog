import { useEffect, useState } from 'react'

import { Routes, Route } from 'react-router-dom';

//import { loadLists, saveLists } from './api/services/storage.js';

import firestoreService from '../api/services/firestoreService.js';

import { __loadMockStorage, __clearStorage } from "../dev/devTools.js";

import ListView from '../components/ListView/ListView.jsx';
import CreateListForm from '../components/CreateListForm/CreateListForm.jsx';
import mockData from '../mockdata.js';
import PatchNotesModal from '../components/PatchNotesModal/PatchNotesModal.jsx';

import DevPanel from "../dev/DevPanel.jsx";
import { formatError } from '../util/errorResponse.js';
import { validateText } from '../util/validation.js';

import { useLists } from '../contexts/ListsContext.jsx';

export default function MainPage(props) {
	const user = props.user;
	const maxLength = props.maxLength;
	const siteName = props.siteName;

	const {
		lists, setLists,

		sortMode, setSortMode,

		handleCreateItem,
		handleItemEdit,
		handleItemDelete,
		handleToggle,

		handleCreateList,
		handleEditListTitle,
		handlePin,
		handleArchive,
		handleRestore,
		handleDeleteList,
	} = useLists();

	return <main>
		<header>
			<section className="lists-container">
				<ListView role="pinned"
					lists={lists}
					onListItemAdd={handleCreateItem}
					onListItemEdit={handleItemEdit}
					onListItemDelete={handleItemDelete}
					onListItemToggle={handleToggle}
					onListTitleChange={handleEditListTitle}
					onListPin={handlePin}
					onListArchive={handleArchive}
					onListRestore={handleRestore}
					onListDelete={handleDeleteList}
					maxLength={maxLength}>
				</ListView>
			</section>
		</header>
		<section className="lists-container">
			<CreateListForm onCreateList={handleCreateList} maxLength={maxLength} />
			<div id="all-lists">
				<h2 id="lists-heading">Current Quests: </h2>
				<select id="sort-dropdown"
					value={sortMode}
					onChange={(event) => {
						setSortMode(event.target.value);
					}}>
					<option value="createdAt">Newest</option>
					<option value="updatedAt">Last updated</option>
					<option value="alphabetical">Alphabetical</option>
					<option value="archived">Archived only</option>
				</select>
				<ListView role="sorted" sortMode={sortMode}
					lists={lists}
					onListItemAdd={handleCreateItem}
					onListItemEdit={handleItemEdit}
					onListItemDelete={handleItemDelete}
					onListItemToggle={handleToggle}
					onListTitleChange={handleEditListTitle}
					onListPin={handlePin}
					onListArchive={handleArchive}
					onListRestore={handleRestore}
					onListDelete={handleDeleteList}
					maxLength={maxLength}>
				</ListView>
			</div>
		</section>
		{import.meta.env.DEV && (
			<DevPanel setLists={setLists}
				userId={user?.uid} />
		)}
	</main>
}