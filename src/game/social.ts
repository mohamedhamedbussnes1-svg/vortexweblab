import { CITY_SHOPS } from './cityLayout';
import {
  APARTMENT_CATALOG,
  CHILD_EXPENSE_COST,
  getChildUnlockStatus,
  MARRIAGE_DOWRY_COST,
  ROMANCE_NPCS,
  VEHICLE_CATALOG,
} from './rules';
import {
  ActiveDialogueSession,
  ApartmentId,
  ChildMember,
  CustomerArchetype,
  DialogueChoice,
  FacialExpression,
  OwnedVehicleId,
  RomanceRuntimeState,
} from './types';

export interface DialogueTurnContext {
  money: number;
  reputation: number;
  activeVehicleId: OwnedVehicleId;
  ownedApartmentIds: ApartmentId[];
  spouseId: string | null;
  children: ChildMember[];
  romanceStates: RomanceRuntimeState[];
  currentDay?: number;
  marriedDay?: number | null;
  marriageElapsedSec?: number;
  canHaveChildNow?: boolean;
}

export interface CustomerServiceInput {
  archetype: CustomerArchetype;
  patienceRatio: number; // 0..1
  chargedPrice: number;
  basePrice: number;
  decorLevel: number;
  goldenSizzle?: boolean;
  served?: boolean;
  hospitalityGiven?: boolean;
}

export interface CustomerServiceEvaluation {
  score: number; // 0..100
  emoji: string;
  moodLabelAr: string;
  moodTone: 'happy' | 'neutral' | 'upset';
  facialExpression: FacialExpression;
  animPose: 'wave' | 'argue' | 'talk' | 'eat';
  dynamicLineAr: string;
}

export interface CustomerDialogueInput {
  targetId: string;
  customerName: string;
  archetype: CustomerArchetype;
  recipeNameAr: string;
  served: boolean;
  feedbackRecorded?: boolean;
  serviceEval: CustomerServiceEvaluation;
}

const ARCHETYPE_ROLE_AR: Record<CustomerArchetype, string> = {
  rushed: 'زبون مستعجل',
  calm: 'زبون هادي ورايق',
  talkative: 'زبون ودود وبيحب الكلام',
  haggler: 'زبون بيفاصل في السعر',
  regular: 'زبون دائم للمحل',
  bulk: 'زبون طلبات كبيرة',
};

export function evaluateCustomerServiceState(
  input: CustomerServiceInput,
): CustomerServiceEvaluation {
  const ratio = input.chargedPrice / Math.max(1, input.basePrice);
  let score = 50;

  if (input.patienceRatio >= 0.72) score += 26;
  else if (input.patienceRatio >= 0.42) score += 8;
  else if (input.patienceRatio >= 0.25) score -= 12;
  else score -= 30;

  if (ratio <= 1.0) score += 18;
  else if (ratio <= 1.2) score += 6;
  else if (ratio <= 1.4) score -= 14;
  else score -= 32;

  score += Math.max(0, input.decorLevel - 1) * 6;
  if (input.goldenSizzle) score += 14;
  if (input.hospitalityGiven) score += 18;
  if (input.archetype === 'rushed' && input.patienceRatio < 0.45) score -= 10;
  if (input.archetype === 'haggler' && ratio > 1.15) score -= 10;

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const isExpensive = ratio > 1.3;
  const isSlow = input.patienceRatio < 0.35;

  if (clamped >= 76) {
    return {
      score: clamped,
      emoji: input.served ? '🤩' : '😊',
      moodLabelAr: input.served ? 'مبسوط جداً من الخدمة' : 'متحمس ورايق',
      moodTone: 'happy',
      facialExpression: 'happy',
      animPose: input.served ? 'wave' : 'talk',
      dynamicLineAr: input.served
        ? input.goldenSizzle
          ? 'الله! طعمية مقرمشة وخدمة صاروخ، تستاهل أحلى مدح يا معلم!'
          : `أحلى ${input.archetype === 'regular' ? 'معلم في الحارة' : 'أكل سخن'}، تسلم إيدك بجد!`
        : 'الريحة تفتح النفس والجو جميل، مستني الطلب على نار!',
    };
  }

  if (clamped >= 52) {
    return {
      score: clamped,
      emoji: input.served ? '😋' : '🙂',
      moodLabelAr: input.served ? 'راضي عن الأكل' : 'مستني بهدوء',
      moodTone: 'neutral',
      facialExpression: input.served ? 'happy' : 'talking',
      animPose: 'talk',
      dynamicLineAr: input.served
        ? 'بالهنا والشفا، طعم جميل وخدمة كويسة يا معلم.'
        : 'مفيش استعجال، ظبطلنا السندوتش على مزاجك يا معلم.',
    };
  }

  if (clamped >= 30) {
    return {
      score: clamped,
      emoji: '😤',
      moodLabelAr: isExpensive ? 'مستاء من السعر' : 'متذمر من التأخير',
      moodTone: 'upset',
      facialExpression: isExpensive && !isSlow ? 'surprised' : 'angry',
      animPose: 'argue',
      dynamicLineAr:
        isExpensive && isSlow
          ? 'الطلب اتأخر والأسعار كمان غالية شوية يا معلم!'
          : isExpensive
            ? 'الأسعار رافعة أوي النهاردة يا معلم، اعمل واجب مع الزباين!'
            : 'إيه التأخير ده يا معلم؟ بقالي كتير واقف على الكاونتر!',
    };
  }

  return {
    score: clamped,
    emoji: '😡',
    moodLabelAr: 'غاضب جداً',
    moodTone: 'upset',
    facialExpression: 'angry',
    animPose: 'argue',
    dynamicLineAr: isExpensive
      ? 'الأسعار نار والخدمة بطيئة أوي! كده هقدم شكوى في المحل!'
      : 'ده كتير أوي التأخير ده! لو مخدتش طلبي هقدم شكوى ومش راجع تاني!',
  };
}

export function createCustomerDialogueSession(
  input: CustomerDialogueInput,
): ActiveDialogueSession {
  const roleTitle = ARCHETYPE_ROLE_AR[input.archetype] ?? 'زبون المحل';
  const statusTag = input.served ? `طلب: ${input.recipeNameAr} (تم التقديم)` : `ينتظر: ${input.recipeNameAr}`;
  const choices: DialogueChoice[] = [];

  if (!input.feedbackRecorded) {
    choices.push(
      {
        id: 'customer-praise',
        labelAr:
          input.serviceEval.score >= 52
            ? 'سماع مدح الزبون وإشادته بالمحل 👍 (+سمعة)'
            : 'استئذان الزبون في كلمة حلوة ومدح رغم الزحمة 👍',
        tone: 'praise',
      },
      {
        id: 'customer-complaint',
        labelAr: 'سماع شكوى الزبون وملاحظته الصريحة 👎 (-سمعة)',
        tone: 'complaint',
      },
    );
  }

  choices.push(
    {
      id: 'customer-hospitality',
      labelAr: 'تطييب خاطر الزبون بكوباية شاي ضيافة ☕ (+صبر وسمعة · ١٠ ج.م)',
      tone: 'hospitality',
      cost: 10,
    },
    {
      id: 'customer-banter',
      labelAr:
        input.archetype === 'haggler'
          ? 'ماشي يا باشا نعملك واجب ونزودلك الطحينة والسلطة 😂'
          : input.archetype === 'rushed'
            ? 'ثواني يا فندم والطلب السخن يكون في إيدك فوراً!'
            : 'منور محل المعلم! أخبار طعم الفول والطعمية إيه معاك؟',
      tone: 'joke',
    },
    { id: 'leave', labelAr: 'تحت أمرك يا فندم · نكمل شغل', tone: 'leave' },
  );

  return {
    targetType: 'customer',
    targetId: input.targetId,
    speakerNameAr: input.customerName,
    speakerRoleAr: `${roleTitle} · ${statusTag}`,
    npcLineAr: input.serviceEval.dynamicLineAr,
    customerEmoji: input.serviceEval.emoji,
    serviceQualityScore: input.serviceEval.score,
    serviceQualityLabelAr: input.serviceEval.moodLabelAr,
    moodTone: input.serviceEval.moodTone,
    choices,
  };
}

export function buildRomanceChoices(
  girlState: RomanceRuntimeState,
  ctx: DialogueTurnContext,
): DialogueChoice[] {
  const choices: DialogueChoice[] = [
    {
      id: 'flirt-light',
      labelAr: 'ده النور قطع في الحارة ولا إنتي اللي منورة الشارع؟',
      tone: 'flirt_sweet',
    },
    {
      id: 'joke-ful',
      labelAr: 'لو طلبت مني سندوتش طعمية، هعملهولك بالطحينة والقلب المفتوح 😂',
      tone: 'joke',
    },
    {
      id: 'respect-talk',
      labelAr: 'أنا شغال على مشروعي وبكبّره، وحبيت أسلّم عليكي بذوق',
      tone: 'respectful',
    },
    {
      id: 'flirt-bold',
      labelAr: 'يا قمر، القمر طالع بالنهار النهاردة ليه بس؟ 😉',
      tone: 'flirt_bold',
    },
    {
      id: 'gift-juice',
      labelAr: 'أعزمك على كوباية عصير قصب ساقع؟ (١٥ ج.م)',
      tone: 'gift',
      cost: 15,
    },
  ];

  if (!girlState.married && girlState.affection >= 70 && !ctx.spouseId) {
    choices.push({
      id: 'propose-marriage',
      labelAr: `تتجوزيني بالحلال يا ست البنات؟ (${MARRIAGE_DOWRY_COST} ج.م)`,
      tone: 'propose',
      cost: MARRIAGE_DOWRY_COST,
    });
  } else if (girlState.married) {
    choices.length = 0;
    choices.push(
      {
        id: 'spouse-love',
        labelAr: 'صباح الخير يا ست الكل، نورتي شقتنا وحياتي ❤️',
        tone: 'flirt_sweet',
      },
      {
        id: 'spouse-gift',
        labelAr: 'جبتلك هدية وشيكولاتة حلوة وانتي قاعدة في البيت (٢٥ ج.م)',
        tone: 'gift',
        cost: 25,
      },
    );
    if (ctx.children.length < 3) {
      const childCheck = getChildUnlockStatus(
        ctx.spouseId,
        ctx.children,
        ctx.currentDay ?? 1,
        ctx.marriedDay ?? null,
        ctx.marriageElapsedSec ?? 0,
      );
      const eligible = ctx.canHaveChildNow ?? childCheck.unlocked;
      choices.push({
        id: 'have-child',
        labelAr: eligible
          ? `عايزين نكبر أسرتنا ونجيب بيبي جديد! (${CHILD_EXPENSE_COST} ج.م)`
          : `فترة الزواج لسه بتكمل (${childCheck.remainingSec}ث أو يوم جديد للخلفة)`,
        tone: 'family',
        cost: CHILD_EXPENSE_COST,
      });
    }
  }

  if (girlState.married || girlState.affection >= 45) {
    choices.push({
      id: 'corniche-ride',
      labelAr: 'تعالي نطلع فسحة بالعربية على الكورنيش 🚗',
      tone: 'ride',
    });
  }

  choices.push({ id: 'leave', labelAr: 'أستأذنك أنا دلوقتي · مع السلامة', tone: 'leave' });
  return choices;
}

export function createInitialDialogueSession(
  targetType: ActiveDialogueSession['targetType'],
  targetId: string,
  ctx: DialogueTurnContext,
): ActiveDialogueSession {
  if (targetType === 'romance' || targetType === 'spouse') {
    const def = ROMANCE_NPCS.find((g) => g.id === targetId) ?? ROMANCE_NPCS[0];
    const st = ctx.romanceStates.find((r) => r.id === def.id) ?? {
      id: def.id,
      affection: 20,
      moodAr: 'مبتسمة',
      talkCount: 0,
      married: false,
    };
    const childCheck = getChildUnlockStatus(
      ctx.spouseId,
      ctx.children,
      ctx.currentDay ?? 1,
      ctx.marriedDay ?? null,
      ctx.marriageElapsedSec ?? 0,
    );
    const eligible = ctx.canHaveChildNow ?? childCheck.unlocked;
    return {
      targetType: st.married ? 'spouse' : 'romance',
      targetId: def.id,
      speakerNameAr: def.nameAr,
      speakerRoleAr: st.married ? `زوجتك · ${def.jobAr}` : `${def.jobAr} (${def.personalityAr})`,
      npcLineAr: st.married
        ? `أهلاً برجوعك يا حبيبي! البيت الثابت منور بوجودك${ctx.children.length > 0 ? ' والولاد بيسلموا عليك' : ''}.`
        : def.introLineAr,
      affection: st.affection,
      married: st.married,
      canPropose: !st.married && st.affection >= 70 && ctx.ownedApartmentIds.length > 0 && !ctx.spouseId,
      canHaveChild: st.married && eligible,
      childWaitRemainingSec: st.married && !eligible ? childCheck.remainingSec : 0,
      choices: buildRomanceChoices(st, ctx),
    };
  }

  if (targetType === 'child') {
    const child = ctx.children.find((c) => c.id === targetId) ?? ctx.children[0];
    const name = child?.nameAr ?? 'آدم';
    return {
      targetType: 'child',
      targetId,
      speakerNameAr: name,
      speakerRoleAr: child?.gender === 'girl' ? 'ابنتك الصغيرة' : 'ابنك البطل',
      npcLineAr: `بابا جه! بابا جه! هتلعب معايا وتجيبلي طعمية ولا مصروف يا بابا؟`,
      choices: [
        { id: 'child-play', labelAr: 'تعالى نحضنك ونلعب شوية يا بطل!', tone: 'family' },
        { id: 'child-money', labelAr: 'خد ١٠ جنيه مصروف واشتري حلويات (١٠ ج.م)', tone: 'gift', cost: 10 },
        { id: 'leave', labelAr: 'خليك شاطر في البيت يا حبيبي', tone: 'leave' },
      ],
    };
  }

  if (targetType === 'household_wife') {
    return {
      targetType: 'household_wife',
      targetId,
      speakerNameAr: 'أمينة',
      speakerRoleAr: 'الزوجة · ست البيت المصري',
      npcLineAr: 'أهلاً برجوعك يا أبو الأولاد! الغدا سخن والشاي على النار، تحب نتجمع في الصالة؟',
      choices: [
        { id: 'hw-love', labelAr: 'تسلم إيدك يا ست الكل، البيت منور بيكي وبالولاد ❤️', tone: 'flirt_sweet' },
        { id: 'hw-eat', labelAr: 'يلا نحضر السفرة ونتغدى مع بعض دلوقتي', tone: 'family' },
        { id: 'hw-gift', labelAr: 'خدي مصروف البيت وهاتي حاجة حلوة ليكي (٣٠ ج.م)', tone: 'gift', cost: 30 },
        { id: 'hw-ride', labelAr: 'سيبي المطبخ وتعالي نطلع فسحة بالعربية على الكورنيش 🚗', tone: 'ride' },
        { id: 'leave', labelAr: 'هكمّل لفة سريعة وراجعلك', tone: 'leave' },
      ],
    };
  }

  if (targetType === 'household_daughter') {
    return {
      targetType: 'household_daughter',
      targetId,
      speakerNameAr: 'نور الصغيرة',
      speakerRoleAr: 'ابنتك في المنزل المشترك',
      npcLineAr: 'بابا حبيبي! عملت واجب المدرسة وقعدت أساعد ماما في المطبخ 🎀',
      choices: [
        { id: 'hd-praise', labelAr: 'برافو عليكي يا أميرة البيت! فخور بيكي أوي', tone: 'respectful' },
        { id: 'hd-tv', labelAr: 'تعالي نتفرج على التلفزيون سوا في الصالة', tone: 'family' },
        { id: 'hd-gift', labelAr: 'خدي ١٥ جنيه مصروف واشتري اللي نفسك فيه (١٥ ج.م)', tone: 'gift', cost: 15 },
        { id: 'leave', labelAr: 'خلي بالك من ماما وأخوكي', tone: 'leave' },
      ],
    };
  }

  if (targetType === 'household_son') {
    return {
      targetType: 'household_son',
      targetId,
      speakerNameAr: 'كريم',
      speakerRoleAr: 'ابنك في المنزل المشترك',
      npcLineAr: 'أهلاً يا بابا! مستنيك نلعب كورة أو تحكيلي عملت كام سندوتش النهاردة! ⚽',
      choices: [
        { id: 'hs-play', labelAr: 'يا بطل! يلا شوية لعب وهزار في الصالة', tone: 'family' },
        { id: 'hs-joke', labelAr: 'لما تكبر هتبقى معلم الفول والطعمية الأول في مصر 😂', tone: 'joke' },
        { id: 'hs-gift', labelAr: 'خد ١٥ جنيه مصروف وهاتلك عصير وحلويات (١٥ ج.م)', tone: 'gift', cost: 15 },
        { id: 'leave', labelAr: 'ذاكر كويس يا بطل!', tone: 'leave' },
      ],
    };
  }

  if (targetType === 'worker') {
    const shop = CITY_SHOPS.find((s) => s.id === targetId || `worker-${s.id}` === targetId);
    return {
      targetType: 'worker',
      targetId,
      speakerNameAr: shop?.workerNameAr ?? 'عامل المحل',
      speakerRoleAr: `${shop?.workerRoleAr ?? 'موظف'} · ${shop?.nameAr ?? 'المحل'}`,
      npcLineAr: shop?.workerLineAr ?? 'أهلاً يا معلم، الشغل ماشي تمام والمحل مفتوح لكل الزباين!',
      choices: [
        { id: 'worker-ask', labelAr: 'الشغل عامل إيه هنا في الشارع النهاردة؟', tone: 'respectful' },
        { id: 'worker-joke', labelAr: 'شد حيلك يا بطل عشان أزودلكم البقشيش 😂', tone: 'joke' },
        { id: 'worker-tip', labelAr: 'تفضل شاي واجب على حسابي (١٠ ج.م)', tone: 'gift', cost: 10 },
        { id: 'leave', labelAr: 'ربنا يعينك · سلام', tone: 'leave' },
      ],
    };
  }

  if (targetType === 'school_staff') {
    return {
      targetType: 'school_staff',
      targetId,
      speakerNameAr: 'أستاذة هناء — مديرة مدرسة بنها الخاصة',
      speakerRoleAr: 'إدارة مدرسة بنها الخاصة (٣ مباني × ٤ طوابق)',
      npcLineAr:
        'أهلاً بحضرتك يا معلم محمد في مدرسة بنها الخاصة! الفصول والملاعب والحوش شغالين بأعلى مستوى. تحب تقدم للابن والابنة؟',
      chatLog: [],
      choices: [
        {
          id: 'school-enroll-both',
          labelAr: 'تقديم الابن والابنة في مدرسة بنها الخاصة 🎒 (5,000 ج.م)',
          tone: 'family',
        },
        { id: 'ped-greet', labelAr: 'أخبار الدراسة والطلاب في الفصول إيه؟', tone: 'respectful' },
        { id: 'leave', labelAr: 'شكراً يا أفندم · مع السلامة', tone: 'leave' },
      ],
    };
  }

  if (targetType === 'student') {
    return {
      targetType: 'student',
      targetId,
      speakerNameAr: 'طالب في مدرسة بنها الخاصة',
      speakerRoleAr: 'طالب · ملعب وحوش المدرسة',
      npcLineAr:
        'أهلاً يا عمو المعلم! إحنا بنلعب كورة في حوش مدرسة بنها الخاصة وبنحب طعمية محلك جداً!',
      chatLog: [],
      choices: [
        { id: 'ped-greet', labelAr: 'شدوا حيلكم في المذاكرة واللعب يا أبطال!', tone: 'respectful' },
        { id: 'ped-joke', labelAr: 'اللي يجيب الدرجات النهائية ليه سندوتش مشكل مجاني 😂', tone: 'joke' },
        { id: 'leave', labelAr: 'بالتوفيق يا ولاد!', tone: 'leave' },
      ],
    };
  }

  if (targetType === 'crew_member') {
    return {
      targetType: 'crew_member',
      targetId,
      speakerNameAr: 'أحد أفراد طاقم المعلم',
      speakerRoleAr: 'فريق العمل والموظفون',
      npcLineAr:
        'أهلاً يا معلم محمد! الشغل ماشي تمام وأنا جعان وعطشان شوية، ولو في حوالة إنستا باي على الموبايل تبقى عظيمة 😉!',
      chatLog: [],
      choices: [
        { id: 'worker-ask', labelAr: 'طمني على الزحمة والطلبات النهاردة', tone: 'respectful' },
        { id: 'worker-tip', labelAr: 'خد واجب عشاء وعصير على حسابي (١٠ ج.م)', tone: 'gift', cost: 10 },
        { id: 'leave', labelAr: 'ربنا يعينك يا بطل', tone: 'leave' },
      ],
    };
  }

  // Regular street pedestrian / neighbor
  return {
    targetType: 'pedestrian',
    targetId,
    speakerNameAr: 'أحد أبناء الحارة',
    speakerRoleAr: 'مواطن في المدينة',
    npcLineAr: 'أهلاً يا معلم! ماشي تتفسح في شوارع المدينة ولا رايح مشوار؟ أنا جعان وعطشان الصراحة!',
    chatLog: [],
    choices: [
      { id: 'ped-greet', labelAr: 'إيه أخبار الشارع والمحلات النهاردة؟', tone: 'respectful' },
      { id: 'ped-joke', labelAr: 'أوعى تكون فطرت من غير فول المعلم!', tone: 'joke' },
      { id: 'ped-promo', labelAr: 'نورنا في محل المعلم، عاملين مشكل سخن وخصم النهاردة!', tone: 'flirt_sweet' },
      { id: 'leave', labelAr: 'نهارك سعيد!', tone: 'leave' },
    ],
  };
}

export function resolveDialogueChoice(
  session: ActiveDialogueSession,
  choice: DialogueChoice,
  ctx: DialogueTurnContext,
): {
  replyAr: string;
  affectionDelta: number;
  reputationDelta: number;
  moneyDelta: number;
  triggerMarry?: boolean;
  triggerChild?: boolean;
  triggerRide?: boolean;
  closeDialogue?: boolean;
  customerEmoji?: string;
  customerMoodTone?: 'happy' | 'neutral' | 'upset';
  customerMoodLabelAr?: string;
  customerExpression?: FacialExpression;
  customerAnim?: 'wave' | 'argue' | 'talk';
  hospitalityRestoresPatience?: boolean;
  feedbackKind?: 'praise' | 'complaint';
} {
  if (choice.tone === 'leave') {
    return { replyAr: 'مع السلامة!', affectionDelta: 0, reputationDelta: 0, moneyDelta: 0, closeDialogue: true };
  }

  if (choice.cost && ctx.money < choice.cost) {
    return {
      replyAr: `عفواً يا معلم، معاك ${Math.round(ctx.money)} ج.م بس والمبلغ المطلوب ${choice.cost} ج.م.`,
      affectionDelta: 0,
      reputationDelta: 0,
      moneyDelta: 0,
    };
  }

  if (session.targetType === 'customer') {
    const score = session.serviceQualityScore ?? 55;
    if (choice.tone === 'praise') {
      const repGain = score >= 76 ? 6 : score >= 52 ? 4 : 1;
      return {
        replyAr:
          score >= 52
            ? `تسلم إيدك يا معلم! أحلى مدح للمحل قدام الحارة كلها، نظافة وطعم وسرعة 🌟 (+${repGain} سمعة)`
            : `بصراحة فيه شوية تأخير، بس الطعم يشفعلك يا معلم.. مدح بسيط عشان تعبك 🙂 (+${repGain} سمعة)`,
        affectionDelta: 0,
        reputationDelta: repGain,
        moneyDelta: 0,
        customerEmoji: score >= 52 ? '🤩' : '🙂',
        customerMoodTone: score >= 52 ? 'happy' : 'neutral',
        customerMoodLabelAr: score >= 52 ? 'قدّم مدح ممتاز للمحل' : 'مدح خفيف',
        customerExpression: 'happy',
        customerAnim: 'wave',
        feedbackKind: 'praise',
      };
    }

    if (choice.tone === 'complaint') {
      const repLoss = score < 35 ? -6 : score < 55 ? -4 : -2;
      return {
        replyAr:
          score < 52
            ? `شكوى رسمية يا معلم: الانتظار طويل والأسعار محتاجة مراجعة عشان الزباين متطفشش 😡 (${repLoss} سمعة)`
            : `ملاحظة وشكوى صغيرة يا كبير: زوّد المخلل والطحينة وخف اليد شوية المرة الجاية 😤 (${repLoss} سمعة)`,
        affectionDelta: 0,
        reputationDelta: repLoss,
        moneyDelta: 0,
        customerEmoji: score < 52 ? '😡' : '😤',
        customerMoodTone: 'upset',
        customerMoodLabelAr: 'قدّم شكوى ضد الخدمة',
        customerExpression: 'angry',
        customerAnim: 'argue',
        feedbackKind: 'complaint',
      };
    }

    if (choice.tone === 'hospitality') {
      return {
        replyAr: 'كتر ألف خيرك على كوباية الشاي والضيافة الأصيلة! خلاص والله راضي ومبسوط على الآخر ☕😊 (+٢ سمعة)',
        affectionDelta: 0,
        reputationDelta: 2,
        moneyDelta: -(choice.cost ?? 10),
        customerEmoji: '😊',
        customerMoodTone: 'happy',
        customerMoodLabelAr: 'انبسط بالضيافة',
        customerExpression: 'happy',
        customerAnim: 'wave',
        hospitalityRestoresPatience: true,
      };
    }

    return {
      replyAr:
        score >= 60
          ? 'الله ينور عليك يا معلم، روحك الحلوة في المحل هي اللي بتجيب الزباين من آخر الشارع 😄'
          : 'ماشي يا معلم، الجدعنة حلوة بس ركّز مع الطلبات والأسعار عشان الزحمة!',
      affectionDelta: 0,
      reputationDelta: score >= 60 ? 1 : 0,
      moneyDelta: 0,
      customerEmoji: score >= 60 ? '😊' : '🙂',
      customerMoodTone: score >= 60 ? 'happy' : 'neutral',
      customerMoodLabelAr: score >= 60 ? 'بيتضحك مع المعلم' : 'بيسمع المعلم',
      customerExpression: score >= 60 ? 'happy' : 'talking',
      customerAnim: 'talk',
    };
  }

  const carCharm = VEHICLE_CATALOG[ctx.activeVehicleId]?.charmBonus ?? 0;
  const aptCharm = ctx.ownedApartmentIds.reduce(
    (best, id) => Math.max(best, APARTMENT_CATALOG[id]?.charmBonus ?? 0),
    0,
  );
  const totalCharm = carCharm + aptCharm + (ctx.reputation >= 75 ? 8 : 0);

  if (session.targetType === 'romance' || session.targetType === 'spouse') {
    const st = ctx.romanceStates.find((r) => r.id === session.targetId);
    const curAff = st?.affection ?? 20;

    if (choice.tone === 'propose') {
      return {
        replyAr: 'يا خبر!! موافقة طبعاً يا معلم ❤️ ألف مبروك علينا شقتنا وحياتنا الجديدة!',
        affectionDelta: 30,
        reputationDelta: 8,
        moneyDelta: 0,
        triggerMarry: true,
      };
    }

    if (choice.tone === 'ride') {
      return {
        replyAr: 'يلا بينا! هستناك تركب العربية وتوصلنا كورنيش النيل عشان نتفسح ❤️',
        affectionDelta: 8,
        reputationDelta: 2,
        moneyDelta: 0,
        triggerRide: true,
      };
    }

    if (choice.tone === 'family') {
      return {
        replyAr: 'أحلى خبر في الدنيا يا حبيبي ❤️ ربنا يباركلنا في ولادنا وينوروا الشقة!',
        affectionDelta: 10,
        reputationDelta: 5,
        moneyDelta: 0,
        triggerChild: true,
      };
    }

    if (choice.tone === 'gift') {
      const gain = 16 + Math.round(totalCharm * 0.25);
      return {
        replyAr:
          st?.married
            ? 'ربنا يخليك ليا يا حبيبي، دايماً فاكرني بذوقك ❤️'
            : 'الله! ذوقك راقي أوي بصراحة، تسلم بجد على العزومة الحلوة دي 😊',
        affectionDelta: gain,
        reputationDelta: 2,
        moneyDelta: -(choice.cost ?? 15),
      };
    }

    if (choice.tone === 'flirt_bold') {
      // Bold Egyptian flirting responds realistically based on current affection + charm!
      if (curAff + totalCharm >= 50) {
        return {
          replyAr: 'يا بكاش 😂 بس كلامك يضحك الصخر والله ودمك خفيف أوي 😉',
          affectionDelta: 14,
          reputationDelta: 1,
          moneyDelta: 0,
        };
      }
      return {
        replyAr: 'احم! إنت بتعاكسني في وسط الشارع كده يا شبح؟ خف شوية على نفسك واتكلم بذوق الأول! 🤨',
        affectionDelta: -4,
        reputationDelta: -1,
        moneyDelta: 0,
      };
    }

    if (choice.tone === 'flirt_sweet') {
      const carLine =
        ctx.activeVehicleId === 'sport_coupe'
          ? ' وكمان عربيتك الكوبيه شيك موت!'
          : ctx.ownedApartmentIds.length > 0
            ? ' وسمعت إنك اشتريت شقة تمليك كمان، ما شاء الله!'
            : '';
      return {
        replyAr: `يا سلام على الكلام الحلو ده 😊${carLine} بصراحة وجودك بيخلي اليوم أحلى!`,
        affectionDelta: 13 + Math.round(totalCharm * 0.2),
        reputationDelta: 2,
        moneyDelta: 0,
      };
    }

    if (choice.tone === 'joke') {
      return {
        replyAr: 'ههههههه متفقين! بس لو نسيت الطحينة والمخلل هعملك محضر في الحارة 😂',
        affectionDelta: 11,
        reputationDelta: 2,
        moneyDelta: 0,
      };
    }

    return {
      replyAr: 'ربنا يوسع رزقك يا معلم، الجدع اللي بيتعب على شغله دايماً محترم في عيون الكل 👍',
      affectionDelta: 10,
      reputationDelta: 3,
      moneyDelta: 0,
    };
  }

  if (session.targetType === 'child') {
    if (choice.tone === 'gift') {
      return {
        replyAr: 'هيييه! شكراً يا أحلى بابا في الدنيا كلها 🎉',
        affectionDelta: 0,
        reputationDelta: 2,
        moneyDelta: -(choice.cost ?? 10),
      };
    }
    return {
      replyAr: 'بحبك يا بابا قد الدنيا! لما أكبر هفتح محل فول وطعمية زيك ❤️',
      affectionDelta: 0,
      reputationDelta: 1,
      moneyDelta: 0,
    };
  }

  if (session.targetType === 'household_wife') {
    if (choice.tone === 'gift') {
      return {
        replyAr: 'ربنا يوسع رزقك ويباركلك في صحتك يا حبيبي ❤️ كده البيت مليان خير!',
        affectionDelta: 0,
        reputationDelta: 4,
        moneyDelta: -(choice.cost ?? 30),
      };
    }
    if (choice.tone === 'family') {
      return {
        replyAr: 'يلا يا ولاد! بابا جه والأكل سخن على السفرة، أحلى لمّة عيلة في الدنيا.',
        affectionDelta: 0,
        reputationDelta: 3,
        moneyDelta: 0,
      };
    }
    if (choice.tone === 'ride') {
      return {
        replyAr: 'الله! بقالي كتير ماطلعتش الكورنيش معاك، يلا اركب العربية وأنا جنبك ❤️',
        affectionDelta: 0,
        reputationDelta: 4,
        moneyDelta: 0,
        triggerRide: true,
      };
    }
    return {
      replyAr: 'وجودك في البيت بالدنيا يا معلم، ربنا يديم علينا الستر والمودة ❤️',
      affectionDelta: 0,
      reputationDelta: 2,
      moneyDelta: 0,
    };
  }

  if (session.targetType === 'household_daughter' || session.targetType === 'household_son') {
    if (choice.tone === 'gift') {
      return {
        replyAr: 'هيييه! شكراً يا بابا، إنت أحسن أب في الدنيا كلها! 🎉',
        affectionDelta: 0,
        reputationDelta: 3,
        moneyDelta: -(choice.cost ?? 15),
      };
    }
    if (choice.tone === 'joke') {
      return {
        replyAr: 'هههههه ماشي يا بابا! وهعملك إعلان مخصوص على يافطة الشارع 😂',
        affectionDelta: 0,
        reputationDelta: 2,
        moneyDelta: 0,
      };
    }
    return {
      replyAr: 'فرحتنا بوجودك معانا في الصالة كبيرة أوي يا بابا ❤️',
      affectionDelta: 0,
      reputationDelta: 2,
      moneyDelta: 0,
    };
  }

  if (session.targetType === 'worker') {
    if (choice.tone === 'gift') {
      return {
        replyAr: 'كتر خيرك يا معلم! ربنا يبارك في رزقك، شرفنا دايماً.',
        affectionDelta: 0,
        reputationDelta: 3,
        moneyDelta: -(choice.cost ?? 10),
      };
    }
    if (choice.tone === 'joke') {
      return {
        replyAr: 'حبيبي يا ريس! ده إنت المعلم الكبير بتاع المنطقة كلها 😂',
        affectionDelta: 0,
        reputationDelta: 1,
        moneyDelta: 0,
      };
    }
    return {
      replyAr: 'الحمد لله الزباين رايحين جايين والمحل مفتوح على طول، أي خدمة تانية؟',
      affectionDelta: 0,
      reputationDelta: 1,
      moneyDelta: 0,
    };
  }

  // Pedestrian replies
  if (choice.tone === 'flirt_sweet') {
    return {
      replyAr: 'أكيد هاجي أفطر عندك يا معلم، مشكل الفول والطعمية بتاعك حكاية!',
      affectionDelta: 0,
      reputationDelta: 2,
      moneyDelta: 0,
    };
  }
  if (choice.tone === 'joke') {
    return {
      replyAr: 'ههههه ده الفطار من عندك فرض عين في الحارة كلها يا كبير!',
      affectionDelta: 0,
      reputationDelta: 1,
      moneyDelta: 0,
    };
  }
  return {
    replyAr: 'الشوارع مليانة حركة وبركة النهاردة، ربنا يرزقنا ويرزقك يا معلم.',
    affectionDelta: 0,
    reputationDelta: 1,
    moneyDelta: 0,
  };
}
