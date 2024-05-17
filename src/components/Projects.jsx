import { Tabs } from "antd";
import KanbanBoard from "./KanbanBoard";
import Tasks from "./Tasks";
import Activity from "./Activity";
import Members from "./Members";

const Projects = () => {
    const onChange = (key) => {
        console.log(key);
    };

    const itemsTab = [
        {
            label: "Tasks",
            key: "1",
            children: <Tasks />,
        },
        {
            label: "Kanban",
            key: "2",
            children: <KanbanBoard />,
        },
        {
            label: "Calendar",
            key: "3",
            children: <>Calendar</>,
        },
        {
            label: "Activity",
            key: "4",
            children: <Activity />,
        },
        {
            label: "Members",
            key: "5",
            children: <Members />,
        },
    ];

    return (
        <Tabs
            onChange={onChange}
            type="card"
            items={itemsTab.map((item, i) => {
                const id = String(i + 1);
                return {
                    label: item.label,
                    key: id,
                    children: item.children,
                };
            })}
        />
    );
};

export default Projects;
