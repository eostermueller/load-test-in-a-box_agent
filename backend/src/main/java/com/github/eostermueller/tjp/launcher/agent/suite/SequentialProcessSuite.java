package com.github.eostermueller.tjp.launcher.agent.suite;


import com.github.eostermueller.tjp.launcher.agent.DefaultFactory;
import com.github.eostermueller.tjp.launcher.agent.Level;
import com.github.eostermueller.tjp.launcher.agent.Messages;
import com.github.eostermueller.tjp.launcher.agent.ProcessKey;
import com.github.eostermueller.tjp.launcher.agent.State;
import com.github.eostermueller.tjp.launcher.agent.StateMachine;
import com.github.eostermueller.tjp.launcher.agent.StateChangeListener;
import com.github.eostermueller.tjp.launcher.agent.StdoutStateChanger;
import com.github.eostermueller.tjp.launcher.agent.TjpException;
import com.github.eostermueller.tjp.launcher.agent.TjpIllegalStateException;

public class SequentialProcessSuite extends AbstractSequentialProcessSuite implements Suite {
	
	public SequentialProcessSuite(ProcessKey keySuite) {
		this.setProcessKey(keySuite);
		this.registerStateChangeListener(this.getChildStateChangeListener() );
	}

	public StateChangeListener getChildStateChangeListener() {
		return childStateChangeListener;
	}

	StateChangeListener childStateChangeListener = new StateChangeListener() {

		private void childStateHasChanged(ProcessKey thisKey, State newState) throws TjpException {
			switch(newState) {
			case START_IN_PROGRESS:
				if (SequentialProcessSuite.this.isFirstRunner(thisKey)) {
					SequentialProcessSuite.this.fireStateChange(SequentialProcessSuite.this.getProcessKey(), State.START_IN_PROGRESS);
				}					
				break;
			case STARTED:
				if (SequentialProcessSuite.this.isFinalRunner(thisKey)) {
					SequentialProcessSuite.this.fireStateChange(SequentialProcessSuite.this.getProcessKey(), State.STARTED);
				} else {
					StateMachine nextRunner = null; 
					StateMachine runner = find( thisKey );
					if (runner !=null) {
						nextRunner = SequentialProcessSuite.this.findNextRunner(runner.getProcessKey());
						if (nextRunner!=null) 
							nextRunner.start();
					} else {
						throw new TjpIllegalStateException(DefaultFactory.getFactory().getMessages().unknownProcessStateTransition(thisKey, newState) );
					}
				} 
				break;
			}
			
		}
		/**
		 * Start the "next" state, once previous has started.
		 */
		@Override
		public void stateHasChanged(ProcessKey thisKey, State newState) throws TjpException {

//			if (thisKey==null)
//				return;
//			System.out.println("New state: [" + newState + "] key ["  + thisKey.getKey() + "]");
			switch (thisKey.getLevel()) {
				case CHILD: //start/stop changes of child processes.
					this.childStateHasChanged(thisKey, newState);
				case PARENT: //summary state change of the entire suite.  at STARTED if all processes have been STARTED.
					this.parentStateHasChanged(thisKey, newState);
			}
		}
		
		/**
		 * Will need this when tracking current state.
		 * @param thisKey
		 * @param newState
		 */
		private void parentStateHasChanged(ProcessKey thisKey, State newState) {
			
			
		}
	};
	/** 
	 * 
	 */
	@Override
	public void addRunnerInOrder(StateMachine child) {

		/** This is where the parent (aka suite) asks to be 
		 *  apprised of all child state changes.
		 */
		child  											 
			.registerStateChangeListener(				 
				this.getChildStateChangeListener());	
		
		this.getRunners().add(child);
	}

	@Override
	public void start() throws TjpException {
		
		StateMachine firstRunner = this.getRunners().get(0);
		firstRunner.start();
		
	}

	@Override
	public void stop() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public boolean isFinalRunner(ProcessKey pk) {
		int indexOfRunner = this.indexOf( pk );
		return (indexOfRunner == this.getRunners().size()-1);
	}

	@Override
	public boolean isFirstRunner(ProcessKey pk) {
		int indexOfRunner = this.indexOf( pk );
		return (indexOfRunner == 0);
	}


}
