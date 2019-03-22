package com.github.eostermueller.tjp.launcher.agent.suite;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import com.github.eostermueller.tjp.launcher.agent.AbstractStateMachine;
import com.github.eostermueller.tjp.launcher.agent.CannotFindTjpFactoryClass;
import com.github.eostermueller.tjp.launcher.agent.DefaultFactory;
import com.github.eostermueller.tjp.launcher.agent.Messages;
import com.github.eostermueller.tjp.launcher.agent.ProcessKey;
import com.github.eostermueller.tjp.launcher.agent.State;
import com.github.eostermueller.tjp.launcher.agent.StateMachine;
import com.github.eostermueller.tjp.launcher.agent.TjpException;

public abstract class AbstractSequentialProcessSuite extends AbstractStateMachine implements Suite {
	List<StateMachine> runners = new CopyOnWriteArrayList<StateMachine>();
	public List<StateMachine> getRunners() {
		return runners;
	}
	public void setRunners(List runners) {
		this.runners = runners;
	}
	@Override
	public void addRunnerInOrder(StateMachine r) {
		this.getRunners().add(r);
	}
	public abstract void start() throws TjpException;

	public abstract void stop();

	int indexOf(ProcessKey processKeyCriteria) {
		int rc = -1;
		for(int i  = 0; i < this.getRunners().size(); i++ ) {
			ProcessKey current = this.getRunners().get(i).getProcessKey();
			
			if (current.getKey().equals(processKeyCriteria.getKey() )) {
					rc = i;
					break;
			}
		}
		return rc;
	}
	public StateMachine findNextRunner(ProcessKey thisProcessKey) {
		
		int thisIndex = indexOf(thisProcessKey);
		
		int indexOfNextRunner = ++thisIndex;
		StateMachine rc = null;
		if (indexOfNextRunner >= 0  && indexOfNextRunner < this.getRunners().size()) {
			rc = this.getRunners().get(indexOfNextRunner);
		}
		
		return rc;
	}
	public StateMachine find(ProcessKey processKeyCriteria) {
		int index = this.indexOf(processKeyCriteria);
		StateMachine rc = null;
		if (index >= 0) {
			rc = this.getRunners().get(index);
		}
		return rc;
	}

}
