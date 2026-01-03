import { useState} from "react";

function Topbar() {

    const [agentQuest, setAgentQuestion] = useState('');

    return (
        <div className="portal-topbar">
            <div className="content flex-row">
                <label className="input icon icon-agent agent-question">
                    Engine Agent
                    <input type="text" id="agent-question" placeholder="I'll be able to help you with tasks soon!" />
                </label>
            </div>
        </div>
    )
}

export default Topbar;
