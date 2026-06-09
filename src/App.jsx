import { useEffect, useState } from 'react'

import './App.css'

//import { loadLists, saveLists } from './api/services/storage.js';

//todo: refactor firestoreService into an exported object of functions
import {
	getLists,
	updateListTitle,
	updateListPin,
	updateListArchived,
}
	from './api/services/firestoreService.js';

import { __loadMockStorage, __clearStorage } from "./dev/devTools.js";

import { onAuthStateChanged } from "firebase/auth";
import { loginWithGoogle, logout } from "./api/services/authService";
import { auth, db } from "./api/firebase";

import { createList } from './api/services/firestoreService';

import ListView from './components/ListView/ListView.jsx';
import TodoItem from './components/TodoItem/TodoItem.jsx';
import List from './components/List/List.jsx';
import CreateListForm from './components/CreateListForm/CreateListForm.jsx';
import mockData from './mockdata.js';
import PatchNotesModal from './components/PatchNotesModal/PatchNotesModal.jsx';

import DevPanel from "./dev/DevPanel.jsx";


export default function App() {
	const [user, setUser] = useState(null);
	const [lists, setLists] = useState([]);

	const [sortMode, setSortMode] = useState(() => {
		return localStorage.getItem("sortmode") || "createdAt";
	});

	const [inputValue, setInputValue] = useState("");

	const [patchnotes, setPatchnotes] = useState([]);
	const [patchnotesOpen, setPatchnotesOpen] = useState(false);

	const [theme, setTheme] = useState("darkMode");
	const [menuOpen, setMenuOpen] = useState(false);

	const [error, setError] = useState("");
	const maxLength = 50;
	const siteName = "QuestLog";

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => {
			setUser(u);
		});

		return unsub;
	}, []);

	useEffect(() => {
		fetch("/changelog.json")
			.then((res) => res.json())
			.then((data) => {

				setPatchnotes(data);
				localStorage.setItem("changelog", JSON.stringify(data));
			});
	}, []);

	//useEffect(() => {
	//console.log("state changed");

	//console.log("updated lists:", lists);
	//saveLists(lists);
	//}, [lists]);

	useEffect(() => {
		if (!user) {
			setLists([])
			return;
		}

		getLists(user.uid).then((lists) => {
			console.log(lists);
			setLists(lists);
		});
	}, [user]);

	useEffect(() => {
		localStorage.setItem("sortmode", sortMode);
	}, [sortMode]);

	function togglePatchnotes() {
		if (patchnotesOpen) {
			setPatchnotesOpen(false);
		} else if (!patchnotesOpen) {
			setPatchnotesOpen(true);
		}
	}
	function toggleDarkMode() {
		if (theme === "darkMode") {
			setTheme("lightMode");
		} else if (theme === "lightMode") {
			setTheme("darkMode")
		}
	}
	function handleCreateList(title) {
		//todo: gate CreateListForm from unauthorized users

		console.log("created list: ", title);

		setLists(prev => [
			...prev,
			{
				id: crypto.randomUUID(),
				title,
				todos: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				pinned: false,
				archived: false,
			}
		]);

		if (user) {
			createList(user, title);
		}
	}
	function handleEditListTitle(listId, newTitle) {
		console.log("received: " + newTitle);

		//todo: assumes the network requests are always successful. 
		// UI state is updated before firestore confirms the update.
		// errors and request fails are unhandled.
		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? { ...list, title: newTitle, updatedAt: Date.now() }
					: list
			)
		);

		updateListTitle(listId, newTitle);
	}
	function handlePin(listId) {
		console.log("pinned: " + listId);

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

		updateListPin(listId, newPinned);
	}
	function handleArchive(listId) {
		const confirmed = window.confirm("Archive this list?");

		if (!confirmed) {
			return;
		}

		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? { ...list, archived: true, updatedAt: Date.now() }
					: list
			)
		);

		updateListArchived(listId, true);
	}
	function handleRestore(listId) {
		const confirmed = window.confirm("Restore this list?");

		if (!confirmed) {
			return;
		}

		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? { ...list, archived: false, updatedAt: Date.now() }
					: list
			)
		);

		updateListArchived(listId, false);
	}
	function handleDeleteList(listId) {
		const confirmed = window.confirm("Delete this list?");

		if (!confirmed) {
			return;
		}

		const updatedState = lists.filter(list => list.id !== listId);
		setLists(updatedState);
	}
	function handleChange(value, listId) {
		setLists(prev => prev.map(list => list.id === listId
			? { ...list, inputValue: value, updatedAt: Date.now() }
			: list
		)
		);
	}
	function handleTodoEdit(listId, todoId, newTodo) {
		console.log("received: " + newTodo);

		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? {
						...list, todos: list.todos.map(todo =>
							todo.id === todoId
								? { ...todo, text: newTodo }
								: todo
						), updatedAt: Date.now()
					}
					: list
			)
		)
	}
	function handleTodoDelete(listId, todoId) {
		console.log("received: " + todoId);

		const confirmed = window.confirm("Delete this task?");

		if (!confirmed) {
			return;
		}

		setLists(prev =>
			prev.map(list => {
				if (list.id !== listId) {
					return list
				} else {
					return {
						...list,
						todos: list.todos.filter(todo => todo.id !== todoId),
						updatedAt: Date.now()
					};
				}
			})
		);
	};
	function handleAdd(text, listId) {
		if (!text.trim()) {
			return;
		}

		setLists(prev => prev.map(list => list.id === listId ? {
			...list,
			todos: [...list.todos,
			{
				id: crypto.randomUUID(),
				text,
				completed: false
			}
			], updatedAt: Date.now()
		} : list
		)
		);
	}
	function handleToggle(listId, todoId) {
		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? {
						...list,
						todos: list.todos.map(todo =>
							todo.id === todoId
								? { ...todo, completed: !todo.completed }
								: todo
						), updatedAt: Date.now()
					}
					: list
			)
		);
	}

	return (
		<div id="app" data-theme={theme}>
			<div id="page-container">
				<header id="top-header">
					<nav>
						<h1>{siteName}</h1>
						<div className="nav-container">
							<div className={`nav-links ${menuOpen ? "opened" : "closed"}`}>
								<button id="patchnotes-toggle" className="wrapped-nav-button" onClick={togglePatchnotes}>Patch Notes</button>
								<button id="dark-mode-toggle" className="wrapped-nav-button" onClick={toggleDarkMode}>🌘 Dark Mode</button>
								{user ?
									<div id="user-info">
										<div id="user-nav-wrapper">
											<div className='user-photo-container'>
												<img src={user.photoURL}></img>
											</div>
											<p className='user-name'>
												{user.displayName}
											</p>
										</div>
										<button className="login-button wrapped-nav-button" onClick={logout}>Logout</button>
									</div>
									: <button className="login-button wrapped-nav-button" onClick={loginWithGoogle}>Sign in</button>
								}
							</div>
							<button
								className="nav-menu-toggle"
								onClick={() => setMenuOpen(prev => !prev)}>
								{menuOpen ? "X" : "☰"}
							</button>
						</div>
					</nav>
				</header>
				<main>
					<header>
						<section className="lists-container">
							<ListView role="pinned"
								lists={lists}
								onListItemChange={handleChange}
								onListItemAdd={handleAdd}
								onListItemEdit={handleTodoEdit}
								onListItemDelete={handleTodoDelete}
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
								onListItemChange={handleChange}
								onListItemAdd={handleAdd}
								onListItemEdit={handleTodoEdit}
								onListItemDelete={handleTodoDelete}
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
			<PatchNotesModal
				open={patchnotesOpen}
				onClose={() => setPatchnotesOpen(false)}
				patchnotes={patchnotes}
			/>
		</div>
	);
}
