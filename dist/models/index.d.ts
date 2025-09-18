import { User } from './User';
import { Category } from './Category';
import { Article } from './Article';
import { Source } from './Source';
import { Ticker } from './Ticker';
import { JobLog } from './JobLog';
export { User, Category, Article, Source, Ticker, JobLog };
export interface IModels {
    User: typeof User;
    Category: typeof Category;
    Article: typeof Article;
    Source: typeof Source;
    Ticker: typeof Ticker;
    JobLog: typeof JobLog;
}
//# sourceMappingURL=index.d.ts.map