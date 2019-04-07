import { EventObject, OmniEventObject, ActionObject } from 'xstate';
import { produce, Draft } from 'immer';
import { actionTypes } from 'xstate/lib/actions';

export type ImmerAssigner<TContext, TEvent extends EventObject> = (
  context: Draft<TContext>,
  event: TEvent
) => void;

export interface ImmerAssignAction<TContext, TEvent extends EventObject>
  extends ActionObject<TContext, TEvent> {
  assignment: ImmerAssigner<TContext, TEvent>;
}

export function assign<TContext, TEvent extends EventObject = EventObject>(
  assignment: ImmerAssigner<TContext, TEvent>
): ImmerAssignAction<TContext, TEvent> {
  return {
    type: actionTypes.assign,
    assignment
  };
}

export function updater<TContext, TEvent extends EventObject>(
  context: TContext,
  event: OmniEventObject<TEvent>,
  assignActions: Array<ImmerAssignAction<TContext, TEvent>>
): TContext {
  const updatedContext = context
    ? assignActions.reduce((acc, assignAction) => {
        const { assignment } = assignAction as ImmerAssignAction<
          TContext,
          OmniEventObject<TEvent>
        >;

        const update = produce(acc, interim => void assignment(interim, event));

        return update;
      }, context)
    : context;

  return updatedContext as TContext;
}
