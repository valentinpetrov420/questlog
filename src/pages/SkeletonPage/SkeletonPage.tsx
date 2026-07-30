import './SkeletonPage.css'
import '../NodePage/NodePage.css';

type SkeletonPageProps = {
    type: "dashboard" | "nodepage",
}

export default function SkeletonPage(props: SkeletonPageProps) {

    //todo: a lot of repeated elements as a result of copypasting a real html tree and then stripping text/values
    // can be fixed with array loops

    switch (props.type) {
        case "dashboard":
            return (
                <div id="dashboard-container">
                    <div className="list-view">
                        <div className="list-component">
                            <div className="list-actions">
                                <div className="skeleton-box"></div>
                            </div>

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="list-component">
                            <div className="list-actions">
                                <div className="skeleton-box"></div>
                            </div>

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="list-component">
                            <div className="list-actions">
                                <div className="skeleton-box"></div>
                            </div>

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <form id="create-list-form">
                        <h2>Add Quest</h2>

                        <p className="form-error"></p>
                    </form>

                    <div className="list-view">
                        <div className="list-component">
                            <div className="list-actions">
                                <div className="skeleton-box"></div>
                            </div>

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="list-component">
                            <div className="list-actions">
                                <div className="skeleton-box"></div>
                            </div>

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="list-component">
                            <div className="list-actions">
                                <div className="skeleton-box"></div>
                            </div>

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="list-component">

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="list-component">
                            <div className="list-actions">
                                <div className="skeleton-box"></div>
                            </div>

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li><div className="todo-wrapper">
                                    <span className="drag-button"></span>
                                    <div className="skeleton-box"></div>
                                    <div className="todo-actions"></div>
                                </div>
                                </li>
                                <li><div className="todo-wrapper">
                                    <span className="drag-button"></span>
                                    <div className="skeleton-box"></div>
                                    <div className="todo-actions"></div>
                                </div>
                                </li>
                                <li><div className="todo-wrapper">
                                    <span className="drag-button"></span>
                                    <div className="skeleton-box"></div>
                                    <div className="todo-actions"></div>
                                </div>
                                </li>
                                <li><div className="todo-wrapper">
                                    <span className="drag-button"></span>
                                    <div className="skeleton-box"></div>
                                    <div className="todo-actions"></div>
                                </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
            break;

        case "nodepage":
            return (
                <div className="list-page-container">
                    <div>
                        <ul className="breadcrumb-tree">
                            <li>
                                <p className="crumb-symbol">➜</p>
                                <div className="skeleton-box"></div>
                            </li>
                            <li>
                                <p className="crumb-symbol">➜</p>
                                <div className="skeleton-box"></div>
                            </li>
                            <li>
                                <p className="crumb-symbol">➜</p>
                                <div className="skeleton-box"></div>
                            </li>
                        </ul>
                    </div>

                    <div className="list-page-wrapper">
                        <div className="list-component">

                            <p className="form-error"></p>

                            <h2 className="list-title">
                                <div className="skeleton-box"></div>
                            </h2>

                            <ul>
                                <li>
                                    <p className="form-error"></p>

                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <p className="form-error"></p>

                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <p className="form-error"></p>

                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <p className="form-error"></p>

                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>

                                <li>
                                    <p className="form-error"></p>

                                    <div className="todo-wrapper">
                                        <span className="drag-button"></span>
                                        <div className="skeleton-box"></div>
                                        <div className="todo-actions"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
    }

}