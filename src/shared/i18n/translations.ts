export type Language = 'zh' | 'ja' | 'ko';

export type T = {
  // ── Common ──
  cancel: string;
  delete: string;
  error: string;
  confirm: string;
  create: string;
  add: string;
  share: string;
  copy: string;
  back: string;

  // ── Tabs ──
  tabLists: string;
  tabReports: string;
  tabRewards: string;
  tabProfile: string;

  // ── Date / Calendar ──
  weekDays: string[];   // Mon–Sun labels for calendar header
  dayOfWeek: string[];  // Sun–Sat for day-of-week display
  dateYearMonth: string;    // date-fns format
  dateFull: string;
  dateMonthDay: string;
  dateFullWithTime: string;
  profileDateLabel: (month: number, day: number, weekday: number) => string;

  // ── Welcome ──
  welcomeSlogan: string;
  welcomeStart: string;
  welcomeHasAccount: string;
  welcomeSignIn: string;

  // ── Sign Up ──
  signUpTitle: string;
  signUpSubtitle: string;
  signUpName: string;
  signUpNamePlaceholder: string;
  signUpEmail: string;
  signUpPassword: string;
  signUpConfirmPassword: string;
  signUpBtn: string;
  signUpHasAccount: string;
  signUpSignInLink: string;
  signUpErrNameMin: string;
  signUpErrEmail: string;
  signUpErrPasswordMin: string;
  signUpErrPasswordMismatch: string;
  signUpAlertTitle: string;

  // ── Sign In ──
  signInTitle: string;
  signInSubtitle: string;
  signInEmail: string;
  signInPassword: string;
  signInBtn: string;
  signInNoAccount: string;
  signInSignUpLink: string;
  signInErrEmail: string;
  signInErrPassword: string;
  signInAlertTitle: string;
  signInAlertMsg: string;

  // ── Join Household ──
  joinTitle: string;
  joinSubtitle: string;
  joinCreateTitle: string;
  joinCreateDesc: string;
  joinJoinTitle: string;
  joinJoinDesc: string;
  joinNameLabel: string;
  joinNamePlaceholder: string;
  joinCodeLabel: string;
  joinCodePlaceholder: string;
  joinCreateBtn: string;
  joinJoinBtn: string;
  joinBack: string;
  joinErrNameMin: string;
  joinErrCodeLength: string;
  joinErrTitle: string;
  joinCreateFailed: string;
  joinJoinFailed: string;

  // ── Home ──
  homeTodayTasks: string;
  homePending: string;
  homeCompleted: string;
  homeNoTasksToday: string;
  homeNoTasksDay: string;
  homeToday: string;
  homeAssignee: string;
  homeNoAssignee: string;
  homeTaskDate: string;
  homePoints: (n: number) => string;
  homeAddTask: string;
  homeTaskName: string;
  homeAddBtn: string;
  homeBackToToday: string;
  homeRewardPointsLabel: string;
  homeWeekLabels: string[];
  homeErrComplete: string;
  homeErrCreate: string;

  // ── All Tasks ──
  allTasksTitle: string;
  allTasksAll: string;
  allTasksUnassigned: string;
  allTasksMembers: string;
  allTasksEmpty: string;
  allTasksAssignTitle: string;
  allTasksAssign: string;
  allTasksPending: (n: number) => string;
  allTasksCompleted: (n: number) => string;
  allTasksDone: (date: string) => string;
  allTasksErrAssign: string;

  // ── Lists ──
  listsTitle: string;
  listsCount: (n: number) => string;
  listsPendingCount: (n: number) => string;
  listsCompleted: string;
  listsPending: string;
  listsEmpty: string;
  listsEmptySubtitle: string;
  listsNew: string;
  listsNamePlaceholder: string;
  listsCreateBtn: string;
  listsDeleteTitle: string;
  listsDeleteConfirm: (name: string) => string;

  // ── List Detail ──
  listDetailDefault: string;
  listDetailChecked: (n: number) => string;
  listDetailEmpty: string;
  listDetailAddPlaceholder: string;
  listDetailDeleteTitle: string;
  listDetailDeleteConfirm: (name: string) => string;

  // ── Reports ──
  reportsWeekly: string;
  reportsMonthly: string;
  reportsLeaderboard: string;
  reportsTrends: string;
  reportsWeeklyTitle: string;
  reportsWeeklySubtitle: (month: string) => string;
  reportsMonthlyTitle: string;
  reportsMonthlySubtitle: (month: string) => string;
  reportsNoMembers: string;
  reportsNoWeekly: string;
  reportsNoMonthly: string;
  reportsShareWeekly: string;
  reportsShareMonthly: string;
  reportsTrend7Title: string;
  reportsTrend30Title: string;
  reportsTrend7Label: string;
  reportsTrend30Label: string;
  reportsMostActive: string;
  reportsNoData: string;
  reportsTaskUnit: string;
  reportsPointsUnit: string;
  reportsShareMsg: (lines: string[]) => string;
  reportsLeaderboardLine: (rank: number, name: string, pts: number) => string;

  // ── Rewards ──
  rewardsTitle: string;
  rewardsMyPoints: string;
  rewardsEarnHint: string;
  rewardsNextReward: (emoji: string, title: string) => string;
  rewardsProgress: (current: number, total: number) => string;
  rewardsSection: string;
  rewardsEmpty: string;
  rewardsCost: (n: number) => string;
  rewardsRedeem: string;
  rewardsAddTitle: string;
  rewardsNamePlaceholder: string;
  rewardsPointsLabel: string;
  rewardsAddBtn: string;
  rewardsDeleteTitle: string;
  rewardsDeleteConfirm: (name: string) => string;
  rewardsInsufficientTitle: string;
  rewardsInsufficientMsg: (name: string, cost: number, mine: number) => string;
  rewardsRedeemTitle: string;
  rewardsRedeemConfirm: (cost: number, name: string) => string;
  rewardsSuccessTitle: string;
  rewardsSuccessMsg: (name: string) => string;
  rewardsRedeemFailed: string;

  // ── Profile ──
  profileGreeting: (name: string) => string;
  profileMonthlyPoints: string;
  profileContribution: string;
  profileAllTime: string;
  profileMemberMgmt: string;
  profileAlarmSettings: string;
  profileRedeemedRewards: string;
  profileSignOutTitle: string;
  profileSignOutMsg: string;
  profileCancelBtn: string;
  profileSignOutBtn: string;
  profileLanguage: string;

  // ── Household Members ──
  householdTitle: string;
  householdMemberCount: (n: number) => string;
  householdInviteCode: string;
  householdCopy: string;
  householdShare: string;
  householdMemberList: string;
  householdAdmin: string;
  householdMember: string;
  householdCopiedTitle: string;
  householdCopiedMsg: (code: string) => string;
  householdShareMsg: (name: string, code: string) => string;

  // ── Redeemed Rewards ──
  redeemedTitle: string;
  redeemedEmpty: string;
  redeemedDateFormat: string;

  // ── Alarm Settings ──
  alarmTitle: string;
  alarmHint: string;
  alarmTodayOnly: string;
  alarmThisWeek: string;
  alarmDaily: string;
  alarmNoTasks: string;
  alarmNoReminder: string;
  alarmSetBtn: string;
  alarmSetDone: string;
  alarmExpired: string;
  alarmNotifTitle: string;
  alarmCancelBtn: string;
  alarmConfirmBtn: string;
  alarmSetTitle: string;
  alarmSetMsg: (freq: string, time: string, taskTitle: string) => string;
  alarmDeleteTitle: string;
  alarmDeleteConfirm: (title: string) => string;
  alarmTimePassedTitle: string;
  alarmTimePassedMsg: string;
  alarmWeekPassedTitle: string;
  alarmWeekPassedMsg: string;
  alarmReminderSuffix: string;

  // ── Language Picker labels ──
  langZh: string;
  langJa: string;
  langKo: string;
};

// ─────────────────────────────────────────────────────────
// CHINESE
// ─────────────────────────────────────────────────────────
export const zh: T = {
  cancel: '取消',
  delete: '删除',
  error: '错误',
  confirm: '确定',
  create: '创建',
  add: '添加',
  share: '分享',
  copy: '复制',
  back: '返回',

  tabLists: '清单',
  tabReports: '报表',
  tabRewards: '奖励',
  tabProfile: '我的',

  weekDays: ['一', '二', '三', '四', '五', '六', '日'],
  dayOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
  dateYearMonth: 'yyyy年M月',
  dateFull: 'yyyy年M月d日',
  dateMonthDay: 'M月d日',
  dateFullWithTime: 'yyyy年M月d日 HH:mm',
  profileDateLabel: (month, day, weekday) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `${month}月${day}日，星期${days[weekday]}`;
  },

  welcomeSlogan: '家的温度\n一起守护',
  welcomeStart: '开始',
  welcomeHasAccount: '已有账户？',
  welcomeSignIn: '登录',

  signUpTitle: '创建账户',
  signUpSubtitle: '加入你的家庭，开始记录家务。',
  signUpName: '你的名字',
  signUpNamePlaceholder: '请输入姓名',
  signUpEmail: '邮箱',
  signUpPassword: '密码',
  signUpConfirmPassword: '确认密码',
  signUpBtn: '创建账户',
  signUpHasAccount: '已有账户？',
  signUpSignInLink: '登录',
  signUpErrNameMin: '姓名至少需要2个字符',
  signUpErrEmail: '请输入有效的邮箱地址',
  signUpErrPasswordMin: '密码至少需要6个字符',
  signUpErrPasswordMismatch: '两次密码输入不一致',
  signUpAlertTitle: '注册失败',

  signInTitle: '欢迎回来',
  signInSubtitle: '登录你的家庭账户。',
  signInEmail: '邮箱',
  signInPassword: '密码',
  signInBtn: '登录',
  signInNoAccount: '还没有账户？',
  signInSignUpLink: '注册',
  signInErrEmail: '请输入有效的邮箱地址',
  signInErrPassword: '密码至少需要6个字符',
  signInAlertTitle: '登录失败',
  signInAlertMsg: '邮箱或密码不正确，请重试。',

  joinTitle: '你的家庭',
  joinSubtitle: '创建新家庭，或使用邀请码加入已有家庭。',
  joinCreateTitle: '创建家庭',
  joinCreateDesc: '创建一个全新的共享空间',
  joinJoinTitle: '加入家庭',
  joinJoinDesc: '输入家庭成员发送的邀请码',
  joinNameLabel: '家庭名称',
  joinNamePlaceholder: '我们的小家',
  joinCodeLabel: '邀请码',
  joinCodePlaceholder: 'ABC123',
  joinCreateBtn: '创建家庭',
  joinJoinBtn: '加入家庭',
  joinBack: '返回',
  joinErrNameMin: '家庭名称至少需要2个字符',
  joinErrCodeLength: '邀请码必须是6位字符',
  joinErrTitle: '错误',
  joinCreateFailed: '创建家庭失败',
  joinJoinFailed: '加入家庭失败',

  homeTodayTasks: '今日任务',
  homePending: '待完成',
  homeCompleted: '已完成',
  homeNoTasksToday: '今天没有任务！',
  homeNoTasksDay: '这天没有任务',
  homeToday: '今天',
  homeAssignee: '负责人',
  homeNoAssignee: '不指定',
  homeTaskDate: '任务日期',
  homePoints: (n) => `${n} 积分`,
  homeAddTask: '添加任务',
  homeTaskName: '任务名称',
  homeAddBtn: '添加',
  homeBackToToday: '回到今天',
  homeRewardPointsLabel: '奖励积分',
  homeWeekLabels: ['一', '二', '三', '四', '五', '六', '日'],
  homeErrComplete: '操作失败',
  homeErrCreate: '创建失败',

  allTasksTitle: '本周全家任务',
  allTasksAll: '全部',
  allTasksUnassigned: '未指定',
  allTasksMembers: '成员',
  allTasksEmpty: '暂无任务',
  allTasksAssignTitle: '指定负责人',
  allTasksAssign: '指定',
  allTasksPending: (n) => `未完成 · ${n}项`,
  allTasksCompleted: (n) => `已完成 · ${n}项`,
  allTasksDone: (date) => `完成 ${date}`,
  allTasksErrAssign: '指定失败，请重试',

  listsTitle: '购物清单',
  listsCount: (n) => `${n} 个清单`,
  listsPendingCount: (n) => `${n} 个待买`,
  listsCompleted: '已完成',
  listsPending: '待买',
  listsEmpty: '暂无清单',
  listsEmptySubtitle: '点击 + 创建购物清单',
  listsNew: '新建清单',
  listsNamePlaceholder: '清单名称，例如：本周采购',
  listsCreateBtn: '创建',
  listsDeleteTitle: '删除清单',
  listsDeleteConfirm: (name) => `确定删除"${name}"？`,

  listDetailDefault: '清单',
  listDetailChecked: (n) => `已勾选 · ${n}`,
  listDetailEmpty: '在下方添加物品',
  listDetailAddPlaceholder: '添加物品...',
  listDetailDeleteTitle: '删除物品',
  listDetailDeleteConfirm: (name) => `确定删除"${name}"？`,

  reportsWeekly: '周报告',
  reportsMonthly: '月报告',
  reportsLeaderboard: '积分榜',
  reportsTrends: '趋势',
  reportsWeeklyTitle: '本周家务贡献',
  reportsWeeklySubtitle: (month) => `${month}本周完成任务`,
  reportsMonthlyTitle: '本月家务贡献',
  reportsMonthlySubtitle: (month) => `${month}完成任务`,
  reportsNoMembers: '暂无成员',
  reportsNoWeekly: '本周暂无完成记录',
  reportsNoMonthly: '本月暂无完成记录',
  reportsShareWeekly: '分享本周报告',
  reportsShareMonthly: '分享本月报告',
  reportsTrend7Title: '近7天完成任务数',
  reportsTrend30Title: '近30天完成任务数',
  reportsTrend7Label: '近7天完成',
  reportsTrend30Label: '近30天完成',
  reportsMostActive: '最活跃',
  reportsNoData: '暂无数据',
  reportsTaskUnit: '项',
  reportsPointsUnit: '积分',
  reportsShareMsg: (lines) => `本周家务排行榜 🏠\n\n${lines.join('\n')}`,
  reportsLeaderboardLine: (rank, name, pts) => `${rank}. ${name} — ${pts} 分`,

  rewardsTitle: '我的奖励',
  rewardsMyPoints: '本周积分',
  rewardsEarnHint: '继续完成任务赚积分',
  rewardsNextReward: (emoji, title) => `距下个奖励 · ${emoji} ${title}`,
  rewardsProgress: (current, total) => `${current} / ${total} 积分`,
  rewardsSection: '兑换奖励',
  rewardsEmpty: '还没有奖励，点击 + 添加',
  rewardsCost: (n) => `需 ${n} 积分`,
  rewardsRedeem: '兑换',
  rewardsAddTitle: '添加奖励',
  rewardsNamePlaceholder: '奖励名称',
  rewardsPointsLabel: '所需积分',
  rewardsAddBtn: '添加',
  rewardsDeleteTitle: '删除奖励',
  rewardsDeleteConfirm: (name) => `确定删除"${name}"？`,
  rewardsInsufficientTitle: '积分不足',
  rewardsInsufficientMsg: (name, cost, mine) => `兑换"${name}"需要 ${cost} 积分，你当前有 ${mine} 积分`,
  rewardsRedeemTitle: '兑换奖励',
  rewardsRedeemConfirm: (cost, name) => `确定用 ${cost} 积分兑换"${name}"？`,
  rewardsSuccessTitle: '成功',
  rewardsSuccessMsg: (name) => `已兑换"${name}"！`,
  rewardsRedeemFailed: '兑换失败',

  profileGreeting: (name) => `你好，\n${name}`,
  profileMonthlyPoints: '本月积分',
  profileContribution: '贡献占比',
  profileAllTime: '累计积分',
  profileMemberMgmt: '家庭成员管理',
  profileAlarmSettings: '闹钟设置',
  profileRedeemedRewards: '已兑换奖励',
  profileSignOutTitle: '退出登录',
  profileSignOutMsg: '确定要退出吗？',
  profileCancelBtn: '取消',
  profileSignOutBtn: '退出',
  profileLanguage: '语言',

  householdTitle: '家庭成员管理',
  householdMemberCount: (n) => `${n} 位成员`,
  householdInviteCode: '邀请码',
  householdCopy: '复制',
  householdShare: '分享',
  householdMemberList: '成员列表',
  householdAdmin: '管理员',
  householdMember: '成员',
  householdCopiedTitle: '已复制',
  householdCopiedMsg: (code) => `邀请码 ${code} 已复制到剪贴板`,
  householdShareMsg: (name, code) => `加入我的家庭「${name}」，邀请码：${code}`,

  redeemedTitle: '已兑换奖励',
  redeemedEmpty: '还没有兑换记录',
  redeemedDateFormat: 'yyyy年M月d日 HH:mm',

  alarmTitle: '闹钟设置',
  alarmHint: '为分配给你的家务设置闹钟',
  alarmTodayOnly: '只今天',
  alarmThisWeek: '本周每天',
  alarmDaily: '每天',
  alarmNoTasks: '没有分配给你的待完成任务',
  alarmNoReminder: '未设置提醒',
  alarmSetBtn: '设置',
  alarmSetDone: '已设置',
  alarmExpired: '已过期',
  alarmNotifTitle: '任务提醒',
  alarmCancelBtn: '取消',
  alarmConfirmBtn: '确认',
  alarmSetTitle: '闹钟已设置',
  alarmSetMsg: (freq, time, taskTitle) => `将在${freq} ${time} 提醒你完成「${taskTitle}」`,
  alarmDeleteTitle: '删除任务',
  alarmDeleteConfirm: (title) => `确定删除「${title}」？`,
  alarmTimePassedTitle: '提示',
  alarmTimePassedMsg: '该时间今天已过，请选择稍后的时间',
  alarmWeekPassedTitle: '提示',
  alarmWeekPassedMsg: '本周剩余时间已过',
  alarmReminderSuffix: '提醒',

  langZh: '中文',
  langJa: '日本語',
  langKo: '한국어',
};

// ─────────────────────────────────────────────────────────
// JAPANESE
// ─────────────────────────────────────────────────────────
export const ja: T = {
  cancel: 'キャンセル',
  delete: '削除',
  error: 'エラー',
  confirm: '確認',
  create: '作成',
  add: '追加',
  share: '共有',
  copy: 'コピー',
  back: '戻る',

  tabLists: 'リスト',
  tabReports: 'レポート',
  tabRewards: 'ご褒美',
  tabProfile: 'マイページ',

  weekDays: ['月', '火', '水', '木', '金', '土', '日'],
  dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'],
  dateYearMonth: 'yyyy年M月',
  dateFull: 'yyyy年M月d日',
  dateMonthDay: 'M月d日',
  dateFullWithTime: 'yyyy年M月d日 HH:mm',
  profileDateLabel: (month, day, weekday) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${month}月${day}日（${days[weekday]}）`;
  },

  welcomeSlogan: '家の温もり\n一緒に守ろう',
  welcomeStart: '始める',
  welcomeHasAccount: 'すでにアカウントをお持ちですか？',
  welcomeSignIn: 'ログイン',

  signUpTitle: 'アカウント作成',
  signUpSubtitle: '家族に参加して、家事を記録しましょう。',
  signUpName: '名前',
  signUpNamePlaceholder: 'お名前を入力',
  signUpEmail: 'メール',
  signUpPassword: 'パスワード',
  signUpConfirmPassword: 'パスワード確認',
  signUpBtn: 'アカウント作成',
  signUpHasAccount: 'すでにアカウントをお持ちですか？',
  signUpSignInLink: 'ログイン',
  signUpErrNameMin: '名前は2文字以上必要です',
  signUpErrEmail: '有効なメールアドレスを入力してください',
  signUpErrPasswordMin: 'パスワードは6文字以上必要です',
  signUpErrPasswordMismatch: 'パスワードが一致しません',
  signUpAlertTitle: '登録失敗',

  signInTitle: 'おかえりなさい',
  signInSubtitle: '家族アカウントにログインします。',
  signInEmail: 'メール',
  signInPassword: 'パスワード',
  signInBtn: 'ログイン',
  signInNoAccount: 'アカウントをお持ちでないですか？',
  signInSignUpLink: '登録',
  signInErrEmail: '有効なメールアドレスを入力してください',
  signInErrPassword: 'パスワードは6文字以上必要です',
  signInAlertTitle: 'ログイン失敗',
  signInAlertMsg: 'メールまたはパスワードが正しくありません。再試行してください。',

  joinTitle: 'あなたの家族',
  joinSubtitle: '新しい家族を作るか、招待コードで既存の家族に参加しましょう。',
  joinCreateTitle: '家族を作る',
  joinCreateDesc: '新しい共有スペースを作成',
  joinJoinTitle: '家族に参加',
  joinJoinDesc: '家族から送られた招待コードを入力',
  joinNameLabel: '家族名',
  joinNamePlaceholder: 'うちの家族',
  joinCodeLabel: '招待コード',
  joinCodePlaceholder: 'ABC123',
  joinCreateBtn: '家族を作る',
  joinJoinBtn: '家族に参加',
  joinBack: '戻る',
  joinErrNameMin: '家族名は2文字以上必要です',
  joinErrCodeLength: '招待コードは6文字必要です',
  joinErrTitle: 'エラー',
  joinCreateFailed: '家族の作成に失敗しました',
  joinJoinFailed: '家族への参加に失敗しました',

  homeTodayTasks: '今日のタスク',
  homePending: '未完了',
  homeCompleted: '完了',
  homeNoTasksToday: '今日はタスクなし！',
  homeNoTasksDay: 'この日はタスクなし',
  homeToday: '今日',
  homeAssignee: '担当者',
  homeNoAssignee: '指定なし',
  homeTaskDate: 'タスク日付',
  homePoints: (n) => `${n} ポイント`,
  homeAddTask: 'タスクを追加',
  homeTaskName: 'タスク名',
  homeAddBtn: '追加',
  homeBackToToday: '今日に戻る',
  homeRewardPointsLabel: 'ポイント',
  homeWeekLabels: ['月', '火', '水', '木', '金', '土', '日'],
  homeErrComplete: '操作に失敗しました',
  homeErrCreate: '作成に失敗しました',

  allTasksTitle: '今週の家族タスク',
  allTasksAll: 'すべて',
  allTasksUnassigned: '未指定',
  allTasksMembers: 'メンバー',
  allTasksEmpty: 'タスクなし',
  allTasksAssignTitle: '担当者を指定',
  allTasksAssign: '指定',
  allTasksPending: (n) => `未完了 · ${n}件`,
  allTasksCompleted: (n) => `完了 · ${n}件`,
  allTasksDone: (date) => `完了 ${date}`,
  allTasksErrAssign: '指定に失敗しました。再試行してください',

  listsTitle: '買い物リスト',
  listsCount: (n) => `${n} 個のリスト`,
  listsPendingCount: (n) => `${n} 個の購入待ち`,
  listsCompleted: '完了',
  listsPending: '購入待ち',
  listsEmpty: 'リストなし',
  listsEmptySubtitle: '+ をタップして買い物リストを作成',
  listsNew: '新しいリスト',
  listsNamePlaceholder: 'リスト名（例：今週の買い物）',
  listsCreateBtn: '作成',
  listsDeleteTitle: 'リストを削除',
  listsDeleteConfirm: (name) => `「${name}」を削除しますか？`,

  listDetailDefault: 'リスト',
  listDetailChecked: (n) => `チェック済み · ${n}`,
  listDetailEmpty: '下に商品を追加',
  listDetailAddPlaceholder: '商品を追加...',
  listDetailDeleteTitle: '商品を削除',
  listDetailDeleteConfirm: (name) => `「${name}」を削除しますか？`,

  reportsWeekly: '週次',
  reportsMonthly: '月次',
  reportsLeaderboard: 'ランキング',
  reportsTrends: 'トレンド',
  reportsWeeklyTitle: '今週の家事貢献',
  reportsWeeklySubtitle: (month) => `${month}今週完了タスク`,
  reportsMonthlyTitle: '今月の家事貢献',
  reportsMonthlySubtitle: (month) => `${month}完了タスク`,
  reportsNoMembers: 'メンバーなし',
  reportsNoWeekly: '今週の完了記録なし',
  reportsNoMonthly: '今月の完了記録なし',
  reportsShareWeekly: '今週のレポートを共有',
  reportsShareMonthly: '今月のレポートを共有',
  reportsTrend7Title: '過去7日間完了タスク数',
  reportsTrend30Title: '過去30日間完了タスク数',
  reportsTrend7Label: '過去7日完了',
  reportsTrend30Label: '過去30日完了',
  reportsMostActive: '最もアクティブ',
  reportsNoData: 'データなし',
  reportsTaskUnit: '件',
  reportsPointsUnit: 'ポイント',
  reportsShareMsg: (lines) => `今週の家事ランキング 🏠\n\n${lines.join('\n')}`,
  reportsLeaderboardLine: (rank, name, pts) => `${rank}. ${name} — ${pts} ポイント`,

  rewardsTitle: 'ご褒美',
  rewardsMyPoints: '今週のポイント',
  rewardsEarnHint: 'タスクを完了してポイントを稼ごう',
  rewardsNextReward: (emoji, title) => `次のご褒美まで · ${emoji} ${title}`,
  rewardsProgress: (current, total) => `${current} / ${total} ポイント`,
  rewardsSection: 'ご褒美と交換',
  rewardsEmpty: 'まだご褒美なし。+ を追加',
  rewardsCost: (n) => `${n} ポイント必要`,
  rewardsRedeem: '交換',
  rewardsAddTitle: 'ご褒美を追加',
  rewardsNamePlaceholder: 'ご褒美名',
  rewardsPointsLabel: '必要ポイント',
  rewardsAddBtn: '追加',
  rewardsDeleteTitle: 'ご褒美を削除',
  rewardsDeleteConfirm: (name) => `「${name}」を削除しますか？`,
  rewardsInsufficientTitle: 'ポイント不足',
  rewardsInsufficientMsg: (name, cost, mine) => `「${name}」の交換には ${cost} ポイント必要ですが、現在 ${mine} ポイントです`,
  rewardsRedeemTitle: 'ご褒美と交換',
  rewardsRedeemConfirm: (cost, name) => `${cost} ポイントで「${name}」と交換しますか？`,
  rewardsSuccessTitle: '成功',
  rewardsSuccessMsg: (name) => `「${name}」と交換しました！`,
  rewardsRedeemFailed: '交換に失敗しました',

  profileGreeting: (name) => `こんにちは、\n${name}`,
  profileMonthlyPoints: '今月のポイント',
  profileContribution: '貢献割合',
  profileAllTime: '累計ポイント',
  profileMemberMgmt: '家族メンバー管理',
  profileAlarmSettings: 'アラーム設定',
  profileRedeemedRewards: '交換済みご褒美',
  profileSignOutTitle: 'ログアウト',
  profileSignOutMsg: 'ログアウトしますか？',
  profileCancelBtn: 'キャンセル',
  profileSignOutBtn: 'ログアウト',
  profileLanguage: '言語',

  householdTitle: '家族メンバー管理',
  householdMemberCount: (n) => `${n} 人のメンバー`,
  householdInviteCode: '招待コード',
  householdCopy: 'コピー',
  householdShare: '共有',
  householdMemberList: 'メンバーリスト',
  householdAdmin: '管理者',
  householdMember: 'メンバー',
  householdCopiedTitle: 'コピー完了',
  householdCopiedMsg: (code) => `招待コード ${code} がクリップボードにコピーされました`,
  householdShareMsg: (name, code) => `「${name}」に参加しよう！招待コード：${code}`,

  redeemedTitle: '交換済みご褒美',
  redeemedEmpty: 'まだ交換記録なし',
  redeemedDateFormat: 'yyyy年M月d日 HH:mm',

  alarmTitle: 'アラーム設定',
  alarmHint: '担当タスクのアラームを設定',
  alarmTodayOnly: '今日のみ',
  alarmThisWeek: '今週毎日',
  alarmDaily: '毎日',
  alarmNoTasks: '担当の未完了タスクなし',
  alarmNoReminder: 'リマインダー未設定',
  alarmSetBtn: '設定',
  alarmSetDone: '設定済み',
  alarmExpired: '期限切れ',
  alarmNotifTitle: 'タスクリマインダー',
  alarmCancelBtn: 'キャンセル',
  alarmConfirmBtn: '確認',
  alarmSetTitle: 'アラーム設定完了',
  alarmSetMsg: (freq, time, taskTitle) => `${freq} ${time} に「${taskTitle}」をリマインドします`,
  alarmDeleteTitle: 'タスクを削除',
  alarmDeleteConfirm: (title) => `「${title}」を削除しますか？`,
  alarmTimePassedTitle: 'お知らせ',
  alarmTimePassedMsg: 'その時刻は過ぎています。後の時刻を選択してください。',
  alarmWeekPassedTitle: 'お知らせ',
  alarmWeekPassedMsg: '今週の残り時間が過ぎています',
  alarmReminderSuffix: 'リマインド',

  langZh: '中文',
  langJa: '日本語',
  langKo: '한국어',
};

// ─────────────────────────────────────────────────────────
// KOREAN
// ─────────────────────────────────────────────────────────
export const ko: T = {
  cancel: '취소',
  delete: '삭제',
  error: '오류',
  confirm: '확인',
  create: '만들기',
  add: '추가',
  share: '공유',
  copy: '복사',
  back: '돌아가기',

  tabLists: '목록',
  tabReports: '보고',
  tabRewards: '보상',
  tabProfile: '내 정보',

  weekDays: ['월', '화', '수', '목', '금', '토', '일'],
  dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
  dateYearMonth: 'yyyy년 M월',
  dateFull: 'yyyy년 M월 d일',
  dateMonthDay: 'M월 d일',
  dateFullWithTime: 'yyyy년 M월 d일 HH:mm',
  profileDateLabel: (month, day, weekday) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${month}월 ${day}일，${days[weekday]}요일`;
  },

  welcomeSlogan: '가족의 온기\n함께 지키다',
  welcomeStart: '시작',
  welcomeHasAccount: '이미 계정이 있나요？',
  welcomeSignIn: '로그인',

  signUpTitle: '계정 만들기',
  signUpSubtitle: '가족에 참여하고 집안일을 기록하세요。',
  signUpName: '이름',
  signUpNamePlaceholder: '이름을 입력하세요',
  signUpEmail: '이메일',
  signUpPassword: '비밀번호',
  signUpConfirmPassword: '비밀번호 확인',
  signUpBtn: '계정 만들기',
  signUpHasAccount: '이미 계정이 있나요？',
  signUpSignInLink: '로그인',
  signUpErrNameMin: '이름은 2자 이상 필요합니다',
  signUpErrEmail: '유효한 이메일 주소를 입력하세요',
  signUpErrPasswordMin: '비밀번호는 6자 이상 필요합니다',
  signUpErrPasswordMismatch: '비밀번호가 일치하지 않습니다',
  signUpAlertTitle: '가입 실패',

  signInTitle: '다시 오신 것을 환영합니다',
  signInSubtitle: '가족 계정에 로그인하세요。',
  signInEmail: '이메일',
  signInPassword: '비밀번호',
  signInBtn: '로그인',
  signInNoAccount: '아직 계정이 없나요？',
  signInSignUpLink: '가입',
  signInErrEmail: '유효한 이메일 주소를 입력하세요',
  signInErrPassword: '비밀번호는 6자 이상 필요합니다',
  signInAlertTitle: '로그인 실패',
  signInAlertMsg: '이메일 또는 비밀번호가 올바르지 않습니다。다시 시도하세요。',

  joinTitle: '나의 가족',
  joinSubtitle: '새 가족을 만들거나 초대 코드로 기존 가족에 참여하세요。',
  joinCreateTitle: '가족 만들기',
  joinCreateDesc: '새로운 공유 공간 만들기',
  joinJoinTitle: '가족 참여',
  joinJoinDesc: '가족이 보낸 초대 코드 입력',
  joinNameLabel: '가족 이름',
  joinNamePlaceholder: '우리 가족',
  joinCodeLabel: '초대 코드',
  joinCodePlaceholder: 'ABC123',
  joinCreateBtn: '가족 만들기',
  joinJoinBtn: '가족 참여',
  joinBack: '돌아가기',
  joinErrNameMin: '가족 이름은 2자 이상 필요합니다',
  joinErrCodeLength: '초대 코드는 6자리여야 합니다',
  joinErrTitle: '오류',
  joinCreateFailed: '가족 만들기에 실패했습니다',
  joinJoinFailed: '가족 참여에 실패했습니다',

  homeTodayTasks: '오늘의 할 일',
  homePending: '미완료',
  homeCompleted: '완료',
  homeNoTasksToday: '오늘은 할 일이 없어요！',
  homeNoTasksDay: '이 날은 할 일이 없어요',
  homeToday: '오늘',
  homeAssignee: '담당자',
  homeNoAssignee: '지정 없음',
  homeTaskDate: '할 일 날짜',
  homePoints: (n) => `${n} 점`,
  homeAddTask: '할 일 추가',
  homeTaskName: '할 일 이름',
  homeAddBtn: '추가',
  homeBackToToday: '오늘로 돌아가기',
  homeRewardPointsLabel: '보상 점수',
  homeWeekLabels: ['월', '화', '수', '목', '금', '토', '일'],
  homeErrComplete: '작업 실패',
  homeErrCreate: '만들기 실패',

  allTasksTitle: '이번 주 가족 할 일',
  allTasksAll: '전체',
  allTasksUnassigned: '미지정',
  allTasksMembers: '멤버',
  allTasksEmpty: '할 일 없음',
  allTasksAssignTitle: '담당자 지정',
  allTasksAssign: '지정',
  allTasksPending: (n) => `미완료 · ${n}개`,
  allTasksCompleted: (n) => `완료 · ${n}개`,
  allTasksDone: (date) => `완료 ${date}`,
  allTasksErrAssign: '지정에 실패했습니다。다시 시도하세요',

  listsTitle: '쇼핑 목록',
  listsCount: (n) => `${n} 개의 목록`,
  listsPendingCount: (n) => `${n} 개 구매 예정`,
  listsCompleted: '완료',
  listsPending: '구매 예정',
  listsEmpty: '목록 없음',
  listsEmptySubtitle: '+ 눌러서 쇼핑 목록 만들기',
  listsNew: '새 목록',
  listsNamePlaceholder: '목록 이름 (예: 이번 주 장보기)',
  listsCreateBtn: '만들기',
  listsDeleteTitle: '목록 삭제',
  listsDeleteConfirm: (name) => `"${name}"을(를) 삭제하시겠습니까？`,

  listDetailDefault: '목록',
  listDetailChecked: (n) => `체크됨 · ${n}`,
  listDetailEmpty: '아래에 항목 추가',
  listDetailAddPlaceholder: '항목 추가...',
  listDetailDeleteTitle: '항목 삭제',
  listDetailDeleteConfirm: (name) => `"${name}"을(를) 삭제하시겠습니까？`,

  reportsWeekly: '주간',
  reportsMonthly: '월간',
  reportsLeaderboard: '순위',
  reportsTrends: '트렌드',
  reportsWeeklyTitle: '이번 주 집안일 기여',
  reportsWeeklySubtitle: (month) => `${month} 이번 주 완료`,
  reportsMonthlyTitle: '이번 달 집안일 기여',
  reportsMonthlySubtitle: (month) => `${month} 완료`,
  reportsNoMembers: '멤버 없음',
  reportsNoWeekly: '이번 주 완료 기록 없음',
  reportsNoMonthly: '이번 달 완료 기록 없음',
  reportsShareWeekly: '이번 주 보고 공유',
  reportsShareMonthly: '이번 달 보고 공유',
  reportsTrend7Title: '최근 7일 완료 작업 수',
  reportsTrend30Title: '최근 30일 완료 작업 수',
  reportsTrend7Label: '최근 7일 완료',
  reportsTrend30Label: '최근 30일 완료',
  reportsMostActive: '가장 활발함',
  reportsNoData: '데이터 없음',
  reportsTaskUnit: '개',
  reportsPointsUnit: '점',
  reportsShareMsg: (lines) => `이번 주 집안일 순위 🏠\n\n${lines.join('\n')}`,
  reportsLeaderboardLine: (rank, name, pts) => `${rank}. ${name} — ${pts} 점`,

  rewardsTitle: '내 보상',
  rewardsMyPoints: '이번 주 점수',
  rewardsEarnHint: '할 일을 완료해서 점수를 벌어요',
  rewardsNextReward: (emoji, title) => `다음 보상까지 · ${emoji} ${title}`,
  rewardsProgress: (current, total) => `${current} / ${total} 점`,
  rewardsSection: '보상 교환',
  rewardsEmpty: '아직 보상이 없어요。+ 추가',
  rewardsCost: (n) => `${n} 점 필요`,
  rewardsRedeem: '교환',
  rewardsAddTitle: '보상 추가',
  rewardsNamePlaceholder: '보상 이름',
  rewardsPointsLabel: '필요 점수',
  rewardsAddBtn: '추가',
  rewardsDeleteTitle: '보상 삭제',
  rewardsDeleteConfirm: (name) => `"${name}"을(를) 삭제하시겠습니까？`,
  rewardsInsufficientTitle: '점수 부족',
  rewardsInsufficientMsg: (name, cost, mine) => `"${name}" 교환에 ${cost} 점이 필요하지만 현재 ${mine} 점입니다`,
  rewardsRedeemTitle: '보상 교환',
  rewardsRedeemConfirm: (cost, name) => `${cost} 점으로 "${name}"을(를) 교환하시겠습니까？`,
  rewardsSuccessTitle: '성공',
  rewardsSuccessMsg: (name) => `"${name}"을(를) 교환했습니다！`,
  rewardsRedeemFailed: '교환 실패',

  profileGreeting: (name) => `안녕하세요，\n${name}`,
  profileMonthlyPoints: '이번 달 점수',
  profileContribution: '기여 비율',
  profileAllTime: '누적 점수',
  profileMemberMgmt: '가족 멤버 관리',
  profileAlarmSettings: '알람 설정',
  profileRedeemedRewards: '교환된 보상',
  profileSignOutTitle: '로그아웃',
  profileSignOutMsg: '로그아웃 하시겠습니까？',
  profileCancelBtn: '취소',
  profileSignOutBtn: '로그아웃',
  profileLanguage: '언어',

  householdTitle: '가족 멤버 관리',
  householdMemberCount: (n) => `${n} 명의 멤버`,
  householdInviteCode: '초대 코드',
  householdCopy: '복사',
  householdShare: '공유',
  householdMemberList: '멤버 목록',
  householdAdmin: '관리자',
  householdMember: '멤버',
  householdCopiedTitle: '복사됨',
  householdCopiedMsg: (code) => `초대 코드 ${code}가 클립보드에 복사됐습니다`,
  householdShareMsg: (name, code) => `"${name}"에 참여하세요！초대 코드：${code}`,

  redeemedTitle: '교환된 보상',
  redeemedEmpty: '아직 교환 기록 없음',
  redeemedDateFormat: 'yyyy년 M월 d일 HH:mm',

  alarmTitle: '알람 설정',
  alarmHint: '할당된 집안일 알람 설정',
  alarmTodayOnly: '오늘만',
  alarmThisWeek: '이번 주 매일',
  alarmDaily: '매일',
  alarmNoTasks: '할당된 미완료 할 일 없음',
  alarmNoReminder: '알림 미설정',
  alarmSetBtn: '설정',
  alarmSetDone: '설정됨',
  alarmExpired: '만료됨',
  alarmNotifTitle: '할 일 알림',
  alarmCancelBtn: '취소',
  alarmConfirmBtn: '확인',
  alarmSetTitle: '알람 설정 완료',
  alarmSetMsg: (freq, time, taskTitle) => `${freq} ${time} 에 「${taskTitle}」을 알림합니다`,
  alarmDeleteTitle: '할 일 삭제',
  alarmDeleteConfirm: (title) => `「${title}」을(를) 삭제하시겠습니까？`,
  alarmTimePassedTitle: '알림',
  alarmTimePassedMsg: '해당 시간이 이미 지났습니다。나중 시간을 선택하세요。',
  alarmWeekPassedTitle: '알림',
  alarmWeekPassedMsg: '이번 주 남은 시간이 지났습니다',
  alarmReminderSuffix: '알림',

  langZh: '中文',
  langJa: '日本語',
  langKo: '한국어',
};

export const TRANSLATIONS: Record<Language, T> = { zh, ja, ko };
