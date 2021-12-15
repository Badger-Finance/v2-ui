import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	BigDecimal: any;
	BigInt: any;
	Bytes: any;
};

export type Approval = Snapshot & {
	__typename?: 'Approval';
	id: Scalars['ID'];
	transactionId: Scalars['Bytes'];
	timestamp: Scalars['Int'];
	token: Token;
	owner: User;
	spender: User;
	amount: Scalars['BigInt'];
};

export type ApprovalDayData = Snapshot & {
	__typename?: 'ApprovalDayData';
	id: Scalars['ID'];
	timestamp: Scalars['Int'];
	token: Token;
	approvals: Scalars['BigInt'];
	revokes: Scalars['BigInt'];
};

export type ApprovalDayData_Filter = {
	id?: Maybe<Scalars['ID']>;
	id_not?: Maybe<Scalars['ID']>;
	id_gt?: Maybe<Scalars['ID']>;
	id_lt?: Maybe<Scalars['ID']>;
	id_gte?: Maybe<Scalars['ID']>;
	id_lte?: Maybe<Scalars['ID']>;
	id_in?: Maybe<Array<Scalars['ID']>>;
	id_not_in?: Maybe<Array<Scalars['ID']>>;
	timestamp?: Maybe<Scalars['Int']>;
	timestamp_not?: Maybe<Scalars['Int']>;
	timestamp_gt?: Maybe<Scalars['Int']>;
	timestamp_lt?: Maybe<Scalars['Int']>;
	timestamp_gte?: Maybe<Scalars['Int']>;
	timestamp_lte?: Maybe<Scalars['Int']>;
	timestamp_in?: Maybe<Array<Scalars['Int']>>;
	timestamp_not_in?: Maybe<Array<Scalars['Int']>>;
	token?: Maybe<Scalars['String']>;
	token_not?: Maybe<Scalars['String']>;
	token_gt?: Maybe<Scalars['String']>;
	token_lt?: Maybe<Scalars['String']>;
	token_gte?: Maybe<Scalars['String']>;
	token_lte?: Maybe<Scalars['String']>;
	token_in?: Maybe<Array<Scalars['String']>>;
	token_not_in?: Maybe<Array<Scalars['String']>>;
	token_contains?: Maybe<Scalars['String']>;
	token_not_contains?: Maybe<Scalars['String']>;
	token_starts_with?: Maybe<Scalars['String']>;
	token_not_starts_with?: Maybe<Scalars['String']>;
	token_ends_with?: Maybe<Scalars['String']>;
	token_not_ends_with?: Maybe<Scalars['String']>;
	approvals?: Maybe<Scalars['BigInt']>;
	approvals_not?: Maybe<Scalars['BigInt']>;
	approvals_gt?: Maybe<Scalars['BigInt']>;
	approvals_lt?: Maybe<Scalars['BigInt']>;
	approvals_gte?: Maybe<Scalars['BigInt']>;
	approvals_lte?: Maybe<Scalars['BigInt']>;
	approvals_in?: Maybe<Array<Scalars['BigInt']>>;
	approvals_not_in?: Maybe<Array<Scalars['BigInt']>>;
	revokes?: Maybe<Scalars['BigInt']>;
	revokes_not?: Maybe<Scalars['BigInt']>;
	revokes_gt?: Maybe<Scalars['BigInt']>;
	revokes_lt?: Maybe<Scalars['BigInt']>;
	revokes_gte?: Maybe<Scalars['BigInt']>;
	revokes_lte?: Maybe<Scalars['BigInt']>;
	revokes_in?: Maybe<Array<Scalars['BigInt']>>;
	revokes_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum ApprovalDayData_OrderBy {
	Id = 'id',
	Timestamp = 'timestamp',
	Token = 'token',
	Approvals = 'approvals',
	Revokes = 'revokes',
}

export type Approval_Filter = {
	id?: Maybe<Scalars['ID']>;
	id_not?: Maybe<Scalars['ID']>;
	id_gt?: Maybe<Scalars['ID']>;
	id_lt?: Maybe<Scalars['ID']>;
	id_gte?: Maybe<Scalars['ID']>;
	id_lte?: Maybe<Scalars['ID']>;
	id_in?: Maybe<Array<Scalars['ID']>>;
	id_not_in?: Maybe<Array<Scalars['ID']>>;
	transactionId?: Maybe<Scalars['Bytes']>;
	transactionId_not?: Maybe<Scalars['Bytes']>;
	transactionId_in?: Maybe<Array<Scalars['Bytes']>>;
	transactionId_not_in?: Maybe<Array<Scalars['Bytes']>>;
	transactionId_contains?: Maybe<Scalars['Bytes']>;
	transactionId_not_contains?: Maybe<Scalars['Bytes']>;
	timestamp?: Maybe<Scalars['Int']>;
	timestamp_not?: Maybe<Scalars['Int']>;
	timestamp_gt?: Maybe<Scalars['Int']>;
	timestamp_lt?: Maybe<Scalars['Int']>;
	timestamp_gte?: Maybe<Scalars['Int']>;
	timestamp_lte?: Maybe<Scalars['Int']>;
	timestamp_in?: Maybe<Array<Scalars['Int']>>;
	timestamp_not_in?: Maybe<Array<Scalars['Int']>>;
	token?: Maybe<Scalars['String']>;
	token_not?: Maybe<Scalars['String']>;
	token_gt?: Maybe<Scalars['String']>;
	token_lt?: Maybe<Scalars['String']>;
	token_gte?: Maybe<Scalars['String']>;
	token_lte?: Maybe<Scalars['String']>;
	token_in?: Maybe<Array<Scalars['String']>>;
	token_not_in?: Maybe<Array<Scalars['String']>>;
	token_contains?: Maybe<Scalars['String']>;
	token_not_contains?: Maybe<Scalars['String']>;
	token_starts_with?: Maybe<Scalars['String']>;
	token_not_starts_with?: Maybe<Scalars['String']>;
	token_ends_with?: Maybe<Scalars['String']>;
	token_not_ends_with?: Maybe<Scalars['String']>;
	owner?: Maybe<Scalars['String']>;
	owner_not?: Maybe<Scalars['String']>;
	owner_gt?: Maybe<Scalars['String']>;
	owner_lt?: Maybe<Scalars['String']>;
	owner_gte?: Maybe<Scalars['String']>;
	owner_lte?: Maybe<Scalars['String']>;
	owner_in?: Maybe<Array<Scalars['String']>>;
	owner_not_in?: Maybe<Array<Scalars['String']>>;
	owner_contains?: Maybe<Scalars['String']>;
	owner_not_contains?: Maybe<Scalars['String']>;
	owner_starts_with?: Maybe<Scalars['String']>;
	owner_not_starts_with?: Maybe<Scalars['String']>;
	owner_ends_with?: Maybe<Scalars['String']>;
	owner_not_ends_with?: Maybe<Scalars['String']>;
	spender?: Maybe<Scalars['String']>;
	spender_not?: Maybe<Scalars['String']>;
	spender_gt?: Maybe<Scalars['String']>;
	spender_lt?: Maybe<Scalars['String']>;
	spender_gte?: Maybe<Scalars['String']>;
	spender_lte?: Maybe<Scalars['String']>;
	spender_in?: Maybe<Array<Scalars['String']>>;
	spender_not_in?: Maybe<Array<Scalars['String']>>;
	spender_contains?: Maybe<Scalars['String']>;
	spender_not_contains?: Maybe<Scalars['String']>;
	spender_starts_with?: Maybe<Scalars['String']>;
	spender_not_starts_with?: Maybe<Scalars['String']>;
	spender_ends_with?: Maybe<Scalars['String']>;
	spender_not_ends_with?: Maybe<Scalars['String']>;
	amount?: Maybe<Scalars['BigInt']>;
	amount_not?: Maybe<Scalars['BigInt']>;
	amount_gt?: Maybe<Scalars['BigInt']>;
	amount_lt?: Maybe<Scalars['BigInt']>;
	amount_gte?: Maybe<Scalars['BigInt']>;
	amount_lte?: Maybe<Scalars['BigInt']>;
	amount_in?: Maybe<Array<Scalars['BigInt']>>;
	amount_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Approval_OrderBy {
	Id = 'id',
	TransactionId = 'transactionId',
	Timestamp = 'timestamp',
	Token = 'token',
	Owner = 'owner',
	Spender = 'spender',
	Amount = 'amount',
}

export type Block_Height = {
	hash?: Maybe<Scalars['Bytes']>;
	number?: Maybe<Scalars['Int']>;
	number_gte?: Maybe<Scalars['Int']>;
};

export type CumulativeApproval = {
	__typename?: 'CumulativeApproval';
	id: Scalars['ID'];
	token: Token;
	spender: User;
	approvals: Scalars['BigInt'];
	revokes: Scalars['BigInt'];
};

export type CumulativeApproval_Filter = {
	id?: Maybe<Scalars['ID']>;
	id_not?: Maybe<Scalars['ID']>;
	id_gt?: Maybe<Scalars['ID']>;
	id_lt?: Maybe<Scalars['ID']>;
	id_gte?: Maybe<Scalars['ID']>;
	id_lte?: Maybe<Scalars['ID']>;
	id_in?: Maybe<Array<Scalars['ID']>>;
	id_not_in?: Maybe<Array<Scalars['ID']>>;
	token?: Maybe<Scalars['String']>;
	token_not?: Maybe<Scalars['String']>;
	token_gt?: Maybe<Scalars['String']>;
	token_lt?: Maybe<Scalars['String']>;
	token_gte?: Maybe<Scalars['String']>;
	token_lte?: Maybe<Scalars['String']>;
	token_in?: Maybe<Array<Scalars['String']>>;
	token_not_in?: Maybe<Array<Scalars['String']>>;
	token_contains?: Maybe<Scalars['String']>;
	token_not_contains?: Maybe<Scalars['String']>;
	token_starts_with?: Maybe<Scalars['String']>;
	token_not_starts_with?: Maybe<Scalars['String']>;
	token_ends_with?: Maybe<Scalars['String']>;
	token_not_ends_with?: Maybe<Scalars['String']>;
	spender?: Maybe<Scalars['String']>;
	spender_not?: Maybe<Scalars['String']>;
	spender_gt?: Maybe<Scalars['String']>;
	spender_lt?: Maybe<Scalars['String']>;
	spender_gte?: Maybe<Scalars['String']>;
	spender_lte?: Maybe<Scalars['String']>;
	spender_in?: Maybe<Array<Scalars['String']>>;
	spender_not_in?: Maybe<Array<Scalars['String']>>;
	spender_contains?: Maybe<Scalars['String']>;
	spender_not_contains?: Maybe<Scalars['String']>;
	spender_starts_with?: Maybe<Scalars['String']>;
	spender_not_starts_with?: Maybe<Scalars['String']>;
	spender_ends_with?: Maybe<Scalars['String']>;
	spender_not_ends_with?: Maybe<Scalars['String']>;
	approvals?: Maybe<Scalars['BigInt']>;
	approvals_not?: Maybe<Scalars['BigInt']>;
	approvals_gt?: Maybe<Scalars['BigInt']>;
	approvals_lt?: Maybe<Scalars['BigInt']>;
	approvals_gte?: Maybe<Scalars['BigInt']>;
	approvals_lte?: Maybe<Scalars['BigInt']>;
	approvals_in?: Maybe<Array<Scalars['BigInt']>>;
	approvals_not_in?: Maybe<Array<Scalars['BigInt']>>;
	revokes?: Maybe<Scalars['BigInt']>;
	revokes_not?: Maybe<Scalars['BigInt']>;
	revokes_gt?: Maybe<Scalars['BigInt']>;
	revokes_lt?: Maybe<Scalars['BigInt']>;
	revokes_gte?: Maybe<Scalars['BigInt']>;
	revokes_lte?: Maybe<Scalars['BigInt']>;
	revokes_in?: Maybe<Array<Scalars['BigInt']>>;
	revokes_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum CumulativeApproval_OrderBy {
	Id = 'id',
	Token = 'token',
	Spender = 'spender',
	Approvals = 'approvals',
	Revokes = 'revokes',
}

export type Erc20 = {
	id: Scalars['ID'];
	name: Scalars['String'];
	symbol: Scalars['String'];
	decimals: Scalars['BigInt'];
	totalSupply: Scalars['BigInt'];
};

export type Erc20_Filter = {
	id?: Maybe<Scalars['ID']>;
	id_not?: Maybe<Scalars['ID']>;
	id_gt?: Maybe<Scalars['ID']>;
	id_lt?: Maybe<Scalars['ID']>;
	id_gte?: Maybe<Scalars['ID']>;
	id_lte?: Maybe<Scalars['ID']>;
	id_in?: Maybe<Array<Scalars['ID']>>;
	id_not_in?: Maybe<Array<Scalars['ID']>>;
	name?: Maybe<Scalars['String']>;
	name_not?: Maybe<Scalars['String']>;
	name_gt?: Maybe<Scalars['String']>;
	name_lt?: Maybe<Scalars['String']>;
	name_gte?: Maybe<Scalars['String']>;
	name_lte?: Maybe<Scalars['String']>;
	name_in?: Maybe<Array<Scalars['String']>>;
	name_not_in?: Maybe<Array<Scalars['String']>>;
	name_contains?: Maybe<Scalars['String']>;
	name_not_contains?: Maybe<Scalars['String']>;
	name_starts_with?: Maybe<Scalars['String']>;
	name_not_starts_with?: Maybe<Scalars['String']>;
	name_ends_with?: Maybe<Scalars['String']>;
	name_not_ends_with?: Maybe<Scalars['String']>;
	symbol?: Maybe<Scalars['String']>;
	symbol_not?: Maybe<Scalars['String']>;
	symbol_gt?: Maybe<Scalars['String']>;
	symbol_lt?: Maybe<Scalars['String']>;
	symbol_gte?: Maybe<Scalars['String']>;
	symbol_lte?: Maybe<Scalars['String']>;
	symbol_in?: Maybe<Array<Scalars['String']>>;
	symbol_not_in?: Maybe<Array<Scalars['String']>>;
	symbol_contains?: Maybe<Scalars['String']>;
	symbol_not_contains?: Maybe<Scalars['String']>;
	symbol_starts_with?: Maybe<Scalars['String']>;
	symbol_not_starts_with?: Maybe<Scalars['String']>;
	symbol_ends_with?: Maybe<Scalars['String']>;
	symbol_not_ends_with?: Maybe<Scalars['String']>;
	decimals?: Maybe<Scalars['BigInt']>;
	decimals_not?: Maybe<Scalars['BigInt']>;
	decimals_gt?: Maybe<Scalars['BigInt']>;
	decimals_lt?: Maybe<Scalars['BigInt']>;
	decimals_gte?: Maybe<Scalars['BigInt']>;
	decimals_lte?: Maybe<Scalars['BigInt']>;
	decimals_in?: Maybe<Array<Scalars['BigInt']>>;
	decimals_not_in?: Maybe<Array<Scalars['BigInt']>>;
	totalSupply?: Maybe<Scalars['BigInt']>;
	totalSupply_not?: Maybe<Scalars['BigInt']>;
	totalSupply_gt?: Maybe<Scalars['BigInt']>;
	totalSupply_lt?: Maybe<Scalars['BigInt']>;
	totalSupply_gte?: Maybe<Scalars['BigInt']>;
	totalSupply_lte?: Maybe<Scalars['BigInt']>;
	totalSupply_in?: Maybe<Array<Scalars['BigInt']>>;
	totalSupply_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Erc20_OrderBy {
	Id = 'id',
	Name = 'name',
	Symbol = 'symbol',
	Decimals = 'decimals',
	TotalSupply = 'totalSupply',
}

export enum OrderDirection {
	Asc = 'asc',
	Desc = 'desc',
}

export type Query = {
	__typename?: 'Query';
	token?: Maybe<Token>;
	tokens: Array<Token>;
	user?: Maybe<User>;
	users: Array<User>;
	approval?: Maybe<Approval>;
	approvals: Array<Approval>;
	cumulativeApproval?: Maybe<CumulativeApproval>;
	cumulativeApprovals: Array<CumulativeApproval>;
	approvalDayData?: Maybe<ApprovalDayData>;
	approvalDayDatas: Array<ApprovalDayData>;
	userApprovalDayData?: Maybe<UserApprovalDayData>;
	userApprovalDayDatas: Array<UserApprovalDayData>;
	erc20?: Maybe<Erc20>;
	erc20S: Array<Erc20>;
	snapshot?: Maybe<Snapshot>;
	snapshots: Array<Snapshot>;
	/** Access to subgraph metadata */
	_meta?: Maybe<_Meta_>;
};

export type QueryTokenArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTokensArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Token_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Token_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryUserArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryUsersArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<User_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<User_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryApprovalArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryApprovalsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Approval_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Approval_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCumulativeApprovalArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCumulativeApprovalsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<CumulativeApproval_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<CumulativeApproval_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryApprovalDayDataArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryApprovalDayDatasArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<ApprovalDayData_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<ApprovalDayData_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryUserApprovalDayDataArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryUserApprovalDayDatasArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<UserApprovalDayData_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<UserApprovalDayData_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryErc20Args = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryErc20SArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Erc20_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Erc20_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerySnapshotArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerySnapshotsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Snapshot_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Snapshot_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type Query_MetaArgs = {
	block?: Maybe<Block_Height>;
};

export type Snapshot = {
	id: Scalars['ID'];
	timestamp: Scalars['Int'];
};

export type Snapshot_Filter = {
	id?: Maybe<Scalars['ID']>;
	id_not?: Maybe<Scalars['ID']>;
	id_gt?: Maybe<Scalars['ID']>;
	id_lt?: Maybe<Scalars['ID']>;
	id_gte?: Maybe<Scalars['ID']>;
	id_lte?: Maybe<Scalars['ID']>;
	id_in?: Maybe<Array<Scalars['ID']>>;
	id_not_in?: Maybe<Array<Scalars['ID']>>;
	timestamp?: Maybe<Scalars['Int']>;
	timestamp_not?: Maybe<Scalars['Int']>;
	timestamp_gt?: Maybe<Scalars['Int']>;
	timestamp_lt?: Maybe<Scalars['Int']>;
	timestamp_gte?: Maybe<Scalars['Int']>;
	timestamp_lte?: Maybe<Scalars['Int']>;
	timestamp_in?: Maybe<Array<Scalars['Int']>>;
	timestamp_not_in?: Maybe<Array<Scalars['Int']>>;
};

export enum Snapshot_OrderBy {
	Id = 'id',
	Timestamp = 'timestamp',
}

export type Subscription = {
	__typename?: 'Subscription';
	token?: Maybe<Token>;
	tokens: Array<Token>;
	user?: Maybe<User>;
	users: Array<User>;
	approval?: Maybe<Approval>;
	approvals: Array<Approval>;
	cumulativeApproval?: Maybe<CumulativeApproval>;
	cumulativeApprovals: Array<CumulativeApproval>;
	approvalDayData?: Maybe<ApprovalDayData>;
	approvalDayDatas: Array<ApprovalDayData>;
	userApprovalDayData?: Maybe<UserApprovalDayData>;
	userApprovalDayDatas: Array<UserApprovalDayData>;
	erc20?: Maybe<Erc20>;
	erc20S: Array<Erc20>;
	snapshot?: Maybe<Snapshot>;
	snapshots: Array<Snapshot>;
	/** Access to subgraph metadata */
	_meta?: Maybe<_Meta_>;
};

export type SubscriptionTokenArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTokensArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Token_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Token_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionUserArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionUsersArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<User_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<User_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionApprovalArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionApprovalsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Approval_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Approval_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCumulativeApprovalArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCumulativeApprovalsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<CumulativeApproval_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<CumulativeApproval_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionApprovalDayDataArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionApprovalDayDatasArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<ApprovalDayData_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<ApprovalDayData_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionUserApprovalDayDataArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionUserApprovalDayDatasArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<UserApprovalDayData_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<UserApprovalDayData_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionErc20Args = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionErc20SArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Erc20_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Erc20_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionSnapshotArgs = {
	id: Scalars['ID'];
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionSnapshotsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Snapshot_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Snapshot_Filter>;
	block?: Maybe<Block_Height>;
	subgraphError?: _SubgraphErrorPolicy_;
};

export type Subscription_MetaArgs = {
	block?: Maybe<Block_Height>;
};

export type Token = Erc20 & {
	__typename?: 'Token';
	id: Scalars['ID'];
	name: Scalars['String'];
	symbol: Scalars['String'];
	decimals: Scalars['BigInt'];
	totalSupply: Scalars['BigInt'];
};

export type Token_Filter = {
	id?: Maybe<Scalars['ID']>;
	id_not?: Maybe<Scalars['ID']>;
	id_gt?: Maybe<Scalars['ID']>;
	id_lt?: Maybe<Scalars['ID']>;
	id_gte?: Maybe<Scalars['ID']>;
	id_lte?: Maybe<Scalars['ID']>;
	id_in?: Maybe<Array<Scalars['ID']>>;
	id_not_in?: Maybe<Array<Scalars['ID']>>;
	name?: Maybe<Scalars['String']>;
	name_not?: Maybe<Scalars['String']>;
	name_gt?: Maybe<Scalars['String']>;
	name_lt?: Maybe<Scalars['String']>;
	name_gte?: Maybe<Scalars['String']>;
	name_lte?: Maybe<Scalars['String']>;
	name_in?: Maybe<Array<Scalars['String']>>;
	name_not_in?: Maybe<Array<Scalars['String']>>;
	name_contains?: Maybe<Scalars['String']>;
	name_not_contains?: Maybe<Scalars['String']>;
	name_starts_with?: Maybe<Scalars['String']>;
	name_not_starts_with?: Maybe<Scalars['String']>;
	name_ends_with?: Maybe<Scalars['String']>;
	name_not_ends_with?: Maybe<Scalars['String']>;
	symbol?: Maybe<Scalars['String']>;
	symbol_not?: Maybe<Scalars['String']>;
	symbol_gt?: Maybe<Scalars['String']>;
	symbol_lt?: Maybe<Scalars['String']>;
	symbol_gte?: Maybe<Scalars['String']>;
	symbol_lte?: Maybe<Scalars['String']>;
	symbol_in?: Maybe<Array<Scalars['String']>>;
	symbol_not_in?: Maybe<Array<Scalars['String']>>;
	symbol_contains?: Maybe<Scalars['String']>;
	symbol_not_contains?: Maybe<Scalars['String']>;
	symbol_starts_with?: Maybe<Scalars['String']>;
	symbol_not_starts_with?: Maybe<Scalars['String']>;
	symbol_ends_with?: Maybe<Scalars['String']>;
	symbol_not_ends_with?: Maybe<Scalars['String']>;
	decimals?: Maybe<Scalars['BigInt']>;
	decimals_not?: Maybe<Scalars['BigInt']>;
	decimals_gt?: Maybe<Scalars['BigInt']>;
	decimals_lt?: Maybe<Scalars['BigInt']>;
	decimals_gte?: Maybe<Scalars['BigInt']>;
	decimals_lte?: Maybe<Scalars['BigInt']>;
	decimals_in?: Maybe<Array<Scalars['BigInt']>>;
	decimals_not_in?: Maybe<Array<Scalars['BigInt']>>;
	totalSupply?: Maybe<Scalars['BigInt']>;
	totalSupply_not?: Maybe<Scalars['BigInt']>;
	totalSupply_gt?: Maybe<Scalars['BigInt']>;
	totalSupply_lt?: Maybe<Scalars['BigInt']>;
	totalSupply_gte?: Maybe<Scalars['BigInt']>;
	totalSupply_lte?: Maybe<Scalars['BigInt']>;
	totalSupply_in?: Maybe<Array<Scalars['BigInt']>>;
	totalSupply_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Token_OrderBy {
	Id = 'id',
	Name = 'name',
	Symbol = 'symbol',
	Decimals = 'decimals',
	TotalSupply = 'totalSupply',
}

export type User = {
	__typename?: 'User';
	id: Scalars['ID'];
	approvals: Array<Approval>;
	sentApprovals: Array<Approval>;
	cumulativeApprovals: Array<CumulativeApproval>;
};

export type UserApprovalsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Approval_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Approval_Filter>;
};

export type UserSentApprovalsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<Approval_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<Approval_Filter>;
};

export type UserCumulativeApprovalsArgs = {
	skip?: Maybe<Scalars['Int']>;
	first?: Maybe<Scalars['Int']>;
	orderBy?: Maybe<CumulativeApproval_OrderBy>;
	orderDirection?: Maybe<OrderDirection>;
	where?: Maybe<CumulativeApproval_Filter>;
};

export type UserApprovalDayData = Snapshot & {
	__typename?: 'UserApprovalDayData';
	id: Scalars['ID'];
	timestamp: Scalars['Int'];
	spender: User;
	token: Token;
	approvals: Scalars['BigInt'];
	revokes: Scalars['BigInt'];
};

export type UserApprovalDayData_Filter = {
	id?: Maybe<Scalars['ID']>;
	id_not?: Maybe<Scalars['ID']>;
	id_gt?: Maybe<Scalars['ID']>;
	id_lt?: Maybe<Scalars['ID']>;
	id_gte?: Maybe<Scalars['ID']>;
	id_lte?: Maybe<Scalars['ID']>;
	id_in?: Maybe<Array<Scalars['ID']>>;
	id_not_in?: Maybe<Array<Scalars['ID']>>;
	timestamp?: Maybe<Scalars['Int']>;
	timestamp_not?: Maybe<Scalars['Int']>;
	timestamp_gt?: Maybe<Scalars['Int']>;
	timestamp_lt?: Maybe<Scalars['Int']>;
	timestamp_gte?: Maybe<Scalars['Int']>;
	timestamp_lte?: Maybe<Scalars['Int']>;
	timestamp_in?: Maybe<Array<Scalars['Int']>>;
	timestamp_not_in?: Maybe<Array<Scalars['Int']>>;
	spender?: Maybe<Scalars['String']>;
	spender_not?: Maybe<Scalars['String']>;
	spender_gt?: Maybe<Scalars['String']>;
	spender_lt?: Maybe<Scalars['String']>;
	spender_gte?: Maybe<Scalars['String']>;
	spender_lte?: Maybe<Scalars['String']>;
	spender_in?: Maybe<Array<Scalars['String']>>;
	spender_not_in?: Maybe<Array<Scalars['String']>>;
	spender_contains?: Maybe<Scalars['String']>;
	spender_not_contains?: Maybe<Scalars['String']>;
	spender_starts_with?: Maybe<Scalars['String']>;
	spender_not_starts_with?: Maybe<Scalars['String']>;
	spender_ends_with?: Maybe<Scalars['String']>;
	spender_not_ends_with?: Maybe<Scalars['String']>;
	token?: Maybe<Scalars['String']>;
	token_not?: Maybe<Scalars['String']>;
	token_gt?: Maybe<Scalars['String']>;
	token_lt?: Maybe<Scalars['String']>;
	token_gte?: Maybe<Scalars['String']>;
	token_lte?: Maybe<Scalars['String']>;
	token_in?: Maybe<Array<Scalars['String']>>;
	token_not_in?: Maybe<Array<Scalars['String']>>;
	token_contains?: Maybe<Scalars['String']>;
	token_not_contains?: Maybe<Scalars['String']>;
	token_starts_with?: Maybe<Scalars['String']>;
	token_not_starts_with?: Maybe<Scalars['String']>;
	token_ends_with?: Maybe<Scalars['String']>;
	token_not_ends_with?: Maybe<Scalars['String']>;
	approvals?: Maybe<Scalars['BigInt']>;
	approvals_not?: Maybe<Scalars['BigInt']>;
	approvals_gt?: Maybe<Scalars['BigInt']>;
	approvals_lt?: Maybe<Scalars['BigInt']>;
	approvals_gte?: Maybe<Scalars['BigInt']>;
	approvals_lte?: Maybe<Scalars['BigInt']>;
	approvals_in?: Maybe<Array<Scalars['BigInt']>>;
	approvals_not_in?: Maybe<Array<Scalars['BigInt']>>;
	revokes?: Maybe<Scalars['BigInt']>;
	revokes_not?: Maybe<Scalars['BigInt']>;
	revokes_gt?: Maybe<Scalars['BigInt']>;
	revokes_lt?: Maybe<Scalars['BigInt']>;
	revokes_gte?: Maybe<Scalars['BigInt']>;
	revokes_lte?: Maybe<Scalars['BigInt']>;
	revokes_in?: Maybe<Array<Scalars['BigInt']>>;
	revokes_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum UserApprovalDayData_OrderBy {
	Id = 'id',
	Timestamp = 'timestamp',
	Spender = 'spender',
	Token = 'token',
	Approvals = 'approvals',
	Revokes = 'revokes',
}

export type User_Filter = {
	id?: Maybe<Scalars['ID']>;
	id_not?: Maybe<Scalars['ID']>;
	id_gt?: Maybe<Scalars['ID']>;
	id_lt?: Maybe<Scalars['ID']>;
	id_gte?: Maybe<Scalars['ID']>;
	id_lte?: Maybe<Scalars['ID']>;
	id_in?: Maybe<Array<Scalars['ID']>>;
	id_not_in?: Maybe<Array<Scalars['ID']>>;
};

export enum User_OrderBy {
	Id = 'id',
	Approvals = 'approvals',
	SentApprovals = 'sentApprovals',
	CumulativeApprovals = 'cumulativeApprovals',
}

export type _Block_ = {
	__typename?: '_Block_';
	/** The hash of the block */
	hash?: Maybe<Scalars['Bytes']>;
	/** The block number */
	number: Scalars['Int'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
	__typename?: '_Meta_';
	/**
	 * Information about a specific subgraph block. The hash of the block
	 * will be null if the _meta field has a block constraint that asks for
	 * a block number. It will be filled if the _meta field has no block constraint
	 * and therefore asks for the latest  block
	 */
	block: _Block_;
	/** The deployment ID */
	deployment: Scalars['String'];
	/** If `true`, the subgraph encountered indexing errors at some past block */
	hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
	/** Data will be returned even if the subgraph has indexing errors */
	Allow = 'allow',
	/** If the subgraph has indexing errors, data will be omitted. The default. */
	Deny = 'deny',
}

export const TokenFragmentDoc = gql`
	fragment Token on Token {
		id
		name
		symbol
		decimals
		totalSupply
	}
`;
export const ApprovalDayDataFragmentDoc = gql`
	fragment ApprovalDayData on ApprovalDayData {
		id
		timestamp
		token {
			...Token
		}
		approvals
		revokes
	}
	${TokenFragmentDoc}
`;
export const ApprovalFragmentDoc = gql`
	fragment Approval on Approval {
		id
		transactionId
		timestamp
		token {
			...Token
		}
		owner {
			id
		}
		spender {
			id
		}
		amount
	}
	${TokenFragmentDoc}
`;
export const CumulativeApprovalFragmentDoc = gql`
	fragment CumulativeApproval on CumulativeApproval {
		id
		token {
			...Token
		}
		spender {
			id
		}
		approvals
		revokes
	}
	${TokenFragmentDoc}
`;
export const UserFragmentDoc = gql`
	fragment User on User {
		id
		approvals {
			...Approval
		}
		sentApprovals {
			...Approval
		}
		cumulativeApprovals {
			...CumulativeApproval
		}
	}
	${ApprovalFragmentDoc}
	${CumulativeApprovalFragmentDoc}
`;
export const UserApprovalDayDataFragmentDoc = gql`
	fragment UserApprovalDayData on UserApprovalDayData {
		id
		timestamp
		spender {
			...User
		}
		token {
			...Token
		}
		approvals
		revokes
	}
	${UserFragmentDoc}
	${TokenFragmentDoc}
`;
export const ApprovalDayDatasDocument = gql`
	query ApprovalDayDatas(
		$first: Int
		$where: ApprovalDayData_filter
		$orderBy: ApprovalDayData_orderBy
		$orderDirection: OrderDirection
	) {
		approvalDayDatas(first: $first, where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {
			...ApprovalDayData
		}
	}
	${ApprovalDayDataFragmentDoc}
`;
export const UserApprovalDayDatasDocument = gql`
	query UserApprovalDayDatas(
		$first: Int
		$where: UserApprovalDayData_filter
		$orderBy: UserApprovalDayData_orderBy
		$orderDirection: OrderDirection
	) {
		userApprovalDayDatas(first: $first, where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {
			...UserApprovalDayData
		}
	}
	${UserApprovalDayDataFragmentDoc}
`;
export const UserDocument = gql`
	query User($id: ID!) {
		user(id: $id) {
			...User
		}
	}
	${UserFragmentDoc}
`;

export type SdkFunctionWrapper = <T>(
	action: (requestHeaders?: Record<string, string>) => Promise<T>,
	operationName: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
	return {
		ApprovalDayDatas(
			variables?: ApprovalDayDatasQueryVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<ApprovalDayDatasQuery> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<ApprovalDayDatasQuery>(ApprovalDayDatasDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders,
					}),
				'ApprovalDayDatas',
			);
		},
		UserApprovalDayDatas(
			variables?: UserApprovalDayDatasQueryVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<UserApprovalDayDatasQuery> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<UserApprovalDayDatasQuery>(UserApprovalDayDatasDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders,
					}),
				'UserApprovalDayDatas',
			);
		},
		User(variables: UserQueryVariables, requestHeaders?: Dom.RequestInit['headers']): Promise<UserQuery> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<UserQuery>(UserDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }),
				'User',
			);
		},
	};
}
export type Sdk = ReturnType<typeof getSdk>;
export type ApprovalDayDataFragment = {
	__typename?: 'ApprovalDayData';
	id: string;
	timestamp: number;
	approvals: any;
	revokes: any;
	token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
};

export type ApprovalFragment = {
	__typename?: 'Approval';
	id: string;
	transactionId: any;
	timestamp: number;
	amount: any;
	token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
	owner: { __typename?: 'User'; id: string };
	spender: { __typename?: 'User'; id: string };
};

export type CumulativeApprovalFragment = {
	__typename?: 'CumulativeApproval';
	id: string;
	approvals: any;
	revokes: any;
	token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
	spender: { __typename?: 'User'; id: string };
};

export type TokenFragment = {
	__typename?: 'Token';
	id: string;
	name: string;
	symbol: string;
	decimals: any;
	totalSupply: any;
};

export type UserApprovalDayDataFragment = {
	__typename?: 'UserApprovalDayData';
	id: string;
	timestamp: number;
	approvals: any;
	revokes: any;
	spender: {
		__typename?: 'User';
		id: string;
		approvals: Array<{
			__typename?: 'Approval';
			id: string;
			transactionId: any;
			timestamp: number;
			amount: any;
			token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
			owner: { __typename?: 'User'; id: string };
			spender: { __typename?: 'User'; id: string };
		}>;
		sentApprovals: Array<{
			__typename?: 'Approval';
			id: string;
			transactionId: any;
			timestamp: number;
			amount: any;
			token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
			owner: { __typename?: 'User'; id: string };
			spender: { __typename?: 'User'; id: string };
		}>;
		cumulativeApprovals: Array<{
			__typename?: 'CumulativeApproval';
			id: string;
			approvals: any;
			revokes: any;
			token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
			spender: { __typename?: 'User'; id: string };
		}>;
	};
	token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
};

export type UserFragment = {
	__typename?: 'User';
	id: string;
	approvals: Array<{
		__typename?: 'Approval';
		id: string;
		transactionId: any;
		timestamp: number;
		amount: any;
		token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
		owner: { __typename?: 'User'; id: string };
		spender: { __typename?: 'User'; id: string };
	}>;
	sentApprovals: Array<{
		__typename?: 'Approval';
		id: string;
		transactionId: any;
		timestamp: number;
		amount: any;
		token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
		owner: { __typename?: 'User'; id: string };
		spender: { __typename?: 'User'; id: string };
	}>;
	cumulativeApprovals: Array<{
		__typename?: 'CumulativeApproval';
		id: string;
		approvals: any;
		revokes: any;
		token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
		spender: { __typename?: 'User'; id: string };
	}>;
};

export type ApprovalDayDatasQueryVariables = Exact<{
	first?: InputMaybe<Scalars['Int']>;
	where?: InputMaybe<ApprovalDayData_Filter>;
	orderBy?: InputMaybe<ApprovalDayData_OrderBy>;
	orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ApprovalDayDatasQuery = {
	__typename?: 'Query';
	approvalDayDatas: Array<{
		__typename?: 'ApprovalDayData';
		id: string;
		timestamp: number;
		approvals: any;
		revokes: any;
		token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
	}>;
};

export type UserApprovalDayDatasQueryVariables = Exact<{
	first?: InputMaybe<Scalars['Int']>;
	where?: InputMaybe<UserApprovalDayData_Filter>;
	orderBy?: InputMaybe<UserApprovalDayData_OrderBy>;
	orderDirection?: InputMaybe<OrderDirection>;
}>;

export type UserApprovalDayDatasQuery = {
	__typename?: 'Query';
	userApprovalDayDatas: Array<{
		__typename?: 'UserApprovalDayData';
		id: string;
		timestamp: number;
		approvals: any;
		revokes: any;
		spender: {
			__typename?: 'User';
			id: string;
			approvals: Array<{
				__typename?: 'Approval';
				id: string;
				transactionId: any;
				timestamp: number;
				amount: any;
				token: {
					__typename?: 'Token';
					id: string;
					name: string;
					symbol: string;
					decimals: any;
					totalSupply: any;
				};
				owner: { __typename?: 'User'; id: string };
				spender: { __typename?: 'User'; id: string };
			}>;
			sentApprovals: Array<{
				__typename?: 'Approval';
				id: string;
				transactionId: any;
				timestamp: number;
				amount: any;
				token: {
					__typename?: 'Token';
					id: string;
					name: string;
					symbol: string;
					decimals: any;
					totalSupply: any;
				};
				owner: { __typename?: 'User'; id: string };
				spender: { __typename?: 'User'; id: string };
			}>;
			cumulativeApprovals: Array<{
				__typename?: 'CumulativeApproval';
				id: string;
				approvals: any;
				revokes: any;
				token: {
					__typename?: 'Token';
					id: string;
					name: string;
					symbol: string;
					decimals: any;
					totalSupply: any;
				};
				spender: { __typename?: 'User'; id: string };
			}>;
		};
		token: { __typename?: 'Token'; id: string; name: string; symbol: string; decimals: any; totalSupply: any };
	}>;
};

export type UserQueryVariables = Exact<{
	id: Scalars['ID'];
}>;

export type UserQuery = {
	__typename?: 'Query';
	user?:
		| {
				__typename?: 'User';
				id: string;
				approvals: Array<{
					__typename?: 'Approval';
					id: string;
					transactionId: any;
					timestamp: number;
					amount: any;
					token: {
						__typename?: 'Token';
						id: string;
						name: string;
						symbol: string;
						decimals: any;
						totalSupply: any;
					};
					owner: { __typename?: 'User'; id: string };
					spender: { __typename?: 'User'; id: string };
				}>;
				sentApprovals: Array<{
					__typename?: 'Approval';
					id: string;
					transactionId: any;
					timestamp: number;
					amount: any;
					token: {
						__typename?: 'Token';
						id: string;
						name: string;
						symbol: string;
						decimals: any;
						totalSupply: any;
					};
					owner: { __typename?: 'User'; id: string };
					spender: { __typename?: 'User'; id: string };
				}>;
				cumulativeApprovals: Array<{
					__typename?: 'CumulativeApproval';
					id: string;
					approvals: any;
					revokes: any;
					token: {
						__typename?: 'Token';
						id: string;
						name: string;
						symbol: string;
						decimals: any;
						totalSupply: any;
					};
					spender: { __typename?: 'User'; id: string };
				}>;
		  }
		| null
		| undefined;
};
