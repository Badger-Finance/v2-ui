import { DiggService } from '@badger-dao/sdk';
import { extendObservable } from 'mobx';
import { RebaseInfo } from 'mobx/model/tokens/rebase-info';

class RebaseStore {
  public rebase?: RebaseInfo;

  constructor() {
    extendObservable(this, {
      rebase: this.rebase,
    });

    this.rebase = {
      sharesPerFragment: DiggService.DIGG_SHARES_PER_FRAGMENT,
    };
  }
}

export default RebaseStore;
