import { useEffect, useState } from 'react'

import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom';

import './App.css'

//import { loadLists, saveLists } from './api/services/storage.js';

import firestoreService from './api/services/firestoreService.js';

import { __loadMockStorage, __clearStorage } from "./dev/devTools.js";

import { onAuthStateChanged } from "firebase/auth";
import { loginWithGoogle, logout } from "./api/services/authService";
import { auth, db } from "./api/firebase";

import NavBar from './components/NavBar/NavBar.jsx';

import ListView from './components/ListView/ListView.jsx';
import CreateListForm from './components/CreateListForm/CreateListForm.jsx';
import mockData from './mockdata.js';
import PatchNotesModal from './components/PatchNotesModal/PatchNotesModal.jsx';

import DevPanel from "./dev/DevPanel.jsx";
import { formatError } from './util/errorResponse.js';
import { validateText } from './util/validation.js';


export default function App() {
	//todo: remove later
	const location = useLocation()

	const [user, setUser] = useState(null);
	const [lists, setLists] = useState([]);

	const [theme, setTheme] = useState(() => {
		return localStorage.getItem("theme") || "darkMode";
	});

	const [sortMode, setSortMode] = useState(() => {
		return localStorage.getItem("sortmode") || "createdAt";
	});

	const [inputValue, setInputValue] = useState("");

	const [error, setError] = useState("");
	const maxLength = 50;
	const siteName = "QuestLog";

	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => {
			setUser(u);
		});

		return unsub;
	}, []);

	//useEffect(() => {
	//console.log("state changed");

	//console.log("updated lists:", lists);
	//saveLists(lists);
	//}, [lists]);

	useEffect(() => {
		if (!user) {
			setLists([]);
			return;
		}

		firestoreService.lists.getHydratedLists(user.uid).then((lists) => {
			console.log(lists);
			setLists(lists);
		});
	}, [user]);

	useEffect(() => {
		localStorage.setItem("sortmode", sortMode);
	}, [sortMode]);

	function toggleDarkMode() {
		if (theme === "darkMode") {
			setTheme("lightMode");
		} else if (theme === "lightMode") {
			setTheme("darkMode")
		}
	}

	async function handleCreateList(title) {
		//todo: gate CreateListForm from unauthorized users
		if (!user) {
			return;
		}

		console.log("created list: ", title);

		const result = validateText(title, maxLength);

		if (!result.valid) {
			return {
				success: false,
				message: result.error
			};
		}

		try {
			const id = await firestoreService.lists.createList(user.uid, result.value);

			setLists(prev => [
				...prev,
				{
					title: result.value,
					id: id,
					items: [],
					createdAt: Date.now(),
					updatedAt: Date.now(),
					pinned: false,
					archived: false,
				}
			]);

			return {
				success: true
			};
		} catch (error) {
			return formatError(error, "Failed to create list", "createList");
		}
	}
	async function handleEditListTitle(listId, newTitle) {
		console.log("received: " + newTitle);

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		const result = validateText(newTitle, maxLength);

		if (!result.valid) {
			return {
				success: false,
				message: result.error
			};
		}

		try {
			await firestoreService.lists.updateListTitle(listId, result.value);

			setLists(prev =>
				prev.map(list =>
					list.id === listId
						? { ...list, title: result.value, updatedAt: Date.now() }
						: list
				)
			);

			return {
				success: true
			};
		} catch (error) {
			return formatError(error, "Failed to edit list", "editListTitle");
		}

	}
	function handlePin(listId) {
		console.log("pinned: " + listId);

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		const targetList = lists.find(list => list.id === listId);

		if (!targetList) {
			return;
		};

		const newPinned = !targetList.pinned;

		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? { ...list, pinned: newPinned, updatedAt: Date.now() }
					: list
			)
		);

		firestoreService.lists.updateListPin(listId, newPinned);
	}
	function handleArchive(listId) {
		const confirmed = window.confirm("Archive this list?");

		if (!confirmed) {
			return;
		}

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? { ...list, archived: true, updatedAt: Date.now() }
					: list
			)
		);

		firestoreService.lists.updateListArchived(listId, true);
	}
	function handleRestore(listId) {
		const confirmed = window.confirm("Restore this list?");

		if (!confirmed) {
			return;
		}

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? { ...list, archived: false, updatedAt: Date.now() }
					: list
			)
		);

		firestoreService.lists.updateListArchived(listId, false);
	}
	async function handleDeleteList(listId) {
		const confirmed = window.confirm("Delete this list?");

		if (!confirmed) {
			return;
		}

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		try {
			await firestoreService.lists.deleteList(listId);

			const updatedState = lists.filter(list => list.id !== listId);
			setLists(updatedState);

			return {
				success: true
			};
		} catch (error) {
			return formatError(error, "Failed to delete list", "deleteList");
		}
	}

	async function handleCreateItem(text, listId) {

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		const result = validateText(text, maxLength);

		if (!result.valid) {
			return {
				success: false,
				message: result.error
			};
		}

		const payload = { text: result.value, type: "todo" };

		try {
			const id = await firestoreService.items.createItem(listId, payload);

			setLists(prev => prev.map(list => list.id === listId ? {
				...list,
				items: [...list.items,
				{
					id: id,
					text: result.value,
					type: "todo",
					completed: false,
				}
				], updatedAt: Date.now()
			} : list
			));

			return {
				success: true
			};
		} catch (error) {
			return formatError(error, "Failed to create item", "createItem");
		}
	}
	function handleToggle(listId, itemId) {
		console.log(listId, itemId);

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		if (!itemId) {
			return {
				success: false,
				message: "Missing itemId"
			};
		}

		const list = lists.find(l => l.id === listId);
		const item = list.items.find(i => i.id === itemId);

		const newCompleted = !item.completed;
		console.log("old: " + item.completed)
		console.log("new: " + newCompleted)

		setLists(prev =>
			prev.map(l =>
				l.id === listId
					? {
						...l,
						items: l.items.map(i =>
							i.id === itemId
								? { ...i, completed: !i.completed }
								: i
						)
					}
					: l
			)
		);

		firestoreService.items.toggleItemCompleted(listId, itemId, newCompleted);
	}
	async function handleItemEdit(listId, itemId, newText) {
		console.log("received: " + newText);

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		if (!itemId) {
			return {
				success: false,
				message: "Missing itemId"
			};
		}

		const result = validateText(newText, maxLength);

		if (!result.valid) {
			return {
				success: false,
				message: result.error
			};
		}

		try {
			await firestoreService.items.editItem(listId, itemId, result.value);

			setLists(prev =>
				prev.map(list =>
					list.id === listId
						? {
							...list, items: list.items.map(item =>
								item.id === itemId
									? { ...item, text: result.value }
									: item
							), updatedAt: Date.now()
						}
						: list
				)
			)

			return {
				success: true
			};
		} catch (error) {
			return formatError(error, "Failed to edit item", "editItem");
		}
	}
	async function handleItemDelete(listId, itemId) {

		const confirmed = window.confirm("Delete this task?");

		if (!confirmed) {
			return;
		}

		if (!listId) {
			return {
				success: false,
				message: "Missing listId"
			};
		}

		if (!itemId) {
			return {
				success: false,
				message: "Missing itemId"
			};
		}

		try {
			await firestoreService.items.deleteItem(listId, itemId);

			setLists(prev =>
				prev.map(list => {
					if (list.id !== listId) {
						return list
					} else {
						return {
							...list,
							items: list.items.filter(item => item.id !== itemId),
							updatedAt: Date.now()
						};
					}
				})
			);

			return {
				success: true
			};
		} catch (error) {
			return formatError(error, "Failed to delete item", "deleteItem");
		}
	}


	return (
		<Routes>
			<Route path="/" element={
				//todo: remove data-route later
				<div id="app" data-theme={theme} data-route={location.pathname}>
					<div id="page-container">
						<header id="top-header">
							<NavBar siteName={siteName}

								theme={theme}
								toggleDarkMode={toggleDarkMode}

								user={user}
								loginWithGoogle={loginWithGoogle}
								logout={logout}
							/>

						</header>
						<main>
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
					</div>
				</div>
			} />
		</Routes>
	);
}