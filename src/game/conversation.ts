import {
  ActiveDialogueSession,
  ChatMessageEntry,
  CharacterNeedsState,
  ElectronicAdBoardState,
  SchoolEnrollmentState,
  WorldObjectChatKind,
} from './types';

export interface ObjectChatMeta {
  titleAr: string;
  subtitleAr: string;
  greetingAr: string;
}

export const WORLD_OBJECT_CHAT_INFO: Record<WorldObjectChatKind, ObjectChatMeta> = {
  ad_board: {
    titleAr: 'شاشة العروض والإعلانات الذكية',
    subtitleAr: 'لوحة إعلانات محل المعلم الإلكترونية',
    greetingAr: 'أنا شاشة العروض الإلكترونية! بعرض خصومات المحل للزباين طول اليوم — عايزني أعلن عن إيه؟',
  },
  car: {
    titleAr: 'سيارة المعلم / النقل',
    subtitleAr: 'مركبة تفاعلية بالمدينة',
    greetingAr: 'الموتور جاهز والكاوتش تمام! تقدر تركب أو تشيك على البنزين أو تسألني عن المشوار.',
  },
  motorcycle: {
    titleAr: 'موتوسيكل الدليفري السريع',
    subtitleAr: 'صندوق دليفري حراري',
    greetingAr: 'صندوق الدليفري سخن وجاهز نطير في الـ ٩٨ شارع نوصل الأوردرات!',
  },
  fuel_pump: {
    titleAr: 'طلمبة بنزين ٩٢ / ٩٥',
    subtitleAr: 'محطة بنزين المعلم',
    greetingAr: 'أهلاً بيك في محطة بنزين المعلم! تحب نفوّل العربية ولا نسأل على الصيانة؟',
  },
  ful_pot: {
    titleAr: 'قدرة الفول المدمس النحاس',
    subtitleAr: 'قلب مطبخ محل المعلم',
    greetingAr: 'الفول بيستوي على نار هادية من الفجر! ريحته وصلت لآخر الحارة.',
  },
  fryer: {
    titleAr: 'قلاية الطعمية والبطاطس',
    subtitleAr: 'طشة ذهبي مقرمشة',
    greetingAr: 'الزيت سخن وبيشفشف! مستعد لأحلى طعمية مقرمشة وبطاطس بالخل والكمون.',
  },
  school_gate: {
    titleAr: 'بوابة مدرسة بنها الخاصة',
    subtitleAr: '٣ مباني × ٤ طوابق · فصول وملاعب',
    greetingAr: 'أهلاً بيك على بوابة مدرسة بنها الخاصة! تقدر تقدم لابنك وبنتك أو تدخل تشوف الحوش والملاعب.',
  },
  classroom_board: {
    titleAr: 'سبورة الفصل الدراسي',
    subtitleAr: 'فصل في مدرسة بنها الخاصة',
    greetingAr: 'الدرس النهاردة عن الحساب والتجارة الشريفة! العيال شاطرين ومجتهدين.',
  },
  tree: {
    titleAr: 'شجرة الشارع الظليلة',
    subtitleAr: 'طبيعة وهواء الحارة',
    greetingAr: 'النسيم حلو تحت الضل ده! خلي بالك من الزحمة وأنت سايق حوالينا.',
  },
  building: {
    titleAr: 'عمارة / برج المدينة',
    subtitleAr: 'عقار سكني وتجاري',
    greetingAr: 'عمارة متشطبة سوبر لوكس! لو المعلم اشتراها هتدخّل إيجار يومي محترم من الموبايل.',
  },
  felucca: {
    titleAr: 'فلوكة كورنيش النيل',
    subtitleAr: 'مركب نيلي تراثي',
    greetingAr: 'الهوا على النيل يرد الروح! أحلى مكان للفسحة مع العيلة والأصحاب.',
  },
  bench: {
    titleAr: 'دكة الكورنيش والراحة',
    subtitleAr: 'استراحة على الممشى',
    greetingAr: 'اقعد خد نفسك وارتاح شوية، الدنيا زحمة والشارع ماشي برزقه.',
  },
  apartment_door: {
    titleAr: 'باب شقة الدور التاني',
    subtitleAr: 'سكن المعلم محمد وموظفيه الثلاثة',
    greetingAr: 'الشقة مفروشة ٤ سراير ومطبخ في شارع هادي بعيد عن الزحمة — اتفضل ارتاح أو كل لقمة!',
  },
};

export function createObjectDialogueSession(
  objectKind: WorldObjectChatKind,
  objectId: string,
  extra?: { customTitleAr?: string; adBoard?: ElectronicAdBoardState },
): ActiveDialogueSession {
  const meta = WORLD_OBJECT_CHAT_INFO[objectKind];
  const line =
    objectKind === 'ad_board' && extra?.adBoard
      ? extra.adBoard.active
        ? `الشاشة مضيئة حالياً: "${extra.adBoard.headlineAr}" (خصم ${extra.adBoard.discountPct}%). اكتب أي إعلان أو كلام بالكيبورد!`
        : 'شاشة العروض مطفية حالياً — تقدر تشغلها من موبايل المعلم أو تطلب هنا!'
      : meta.greetingAr;

  return {
    targetType: 'world_object',
    targetId: objectId,
    objectKind,
    speakerNameAr: extra?.customTitleAr || meta.titleAr,
    speakerRoleAr: meta.subtitleAr,
    npcLineAr: line,
    chatLog: [],
    choices: [
      ...(objectKind === 'school_gate'
        ? [
            {
              id: 'obj-enroll-both',
              labelAr: 'تقديم الابن والابنة في مدرسة بنها الخاصة 🎒 (5,000 ج.م)',
              tone: 'family' as const,
            },
          ]
        : []),
      ...(objectKind === 'fuel_pump'
        ? [
            {
              id: 'obj-refuel',
              labelAr: 'تفويل السيارة ١٠٠٪ بنزين ⛽ (20 ج.م)',
              tone: 'gift' as const,
              cost: 20,
            },
          ]
        : []),
      {
        id: 'obj-greet',
        labelAr: 'صباح الفل · إيه الأخبار هنا؟',
        tone: 'respectful',
      },
      { id: 'leave', labelAr: 'تمام · شكراً', tone: 'leave' },
    ],
  };
}

export type ChatActionEffect =
  | 'none'
  | 'accompany_me'
  | 'hold_son_hand'
  | 'stop_accompany'
  | 'board_vehicle'
  | 'enroll_son'
  | 'enroll_daughter'
  | 'enroll_both'
  | 'give_food'
  | 'give_drink'
  | 'refuel_car'
  | 'boost_ad_promo';

export interface SmartChatReply {
  replyAr: string;
  animPose: 'talk' | 'wave' | 'argue' | 'eat' | 'hold_hand';
  effect: ChatActionEffect;
  affectionDelta: number;
  reputationDelta: number;
}

export function generateSmartArabicReply(params: {
  session: ActiveDialogueSession;
  playerMessage: string;
  playerNeeds?: CharacterNeedsState;
  schoolEnrollment?: SchoolEnrollmentState;
  playerNameAr?: string;
}): SmartChatReply {
  const msg = params.playerMessage.trim();
  const lower = msg.toLowerCase();
  const s = params.session;
  const sender = params.playerNameAr || 'يا معلم';

  // Detect action intents from keyboard text (Arabic / Franco / English)
  const wantsHoldHand =
    /امسك إيد|امسك ايد|بإيدي|بايدي|إيدك|ايدك|هات إيد|هات ايد|hand/i.test(msg);
  const wantsAccompany =
    /تعالى مع|تعال مع|اصطحب|تيجي مع|يلا مع|خليك مع|follow|come with|مشوار/i.test(msg);
  const wantsLeaveParty =
    /ارجع|استنى هنا|سيب إيد|سيب ايد|خليك مكانك|لوحدك|stop/i.test(msg);
  const wantsBoard =
    /اركب|العربية|السيارة|نصف نقل|الصندوق|الكابينة|الموتوسيكل|ride|car/i.test(msg);
  const wantsEnroll =
    /تقديم|سجل|قدم|ادخل المدرسة|مدرسة بنها|التقديم|enroll|school/i.test(msg);
  const wantsFood =
    /جوع|جعان|اكل|أكل|فول|طعمية|سندوتش|غدا|فطار|eat|food|hungry/i.test(msg);
  const wantsDrink =
    /عطش|عطشان|مية|مياه|عصير|شاي|قصب|شرب|drink|water|thirst/i.test(msg);
  const wantsRefuel = /بنزين|فول|تفويل|طلمبة|fuel|gas/i.test(msg);
  const wantsLoveOrPraise =
    /بحبك|حبيبي|يا قمر|منور|جدع|عسل|شاطر|الله ينور|صباح|مساء|اهلا|أهلا|سلام|hello|hi/i.test(msg);
  const wantsComplaintOrAngry = /زعلان|وحش|غالي|تأخير|مقصر|اتأخرت/i.test(msg);

  // World Object conversation
  if (s.targetType === 'world_object') {
    if (s.objectKind === 'school_gate' && wantsEnroll) {
      return {
        replyAr:
          'أهلاً يا معلم محمد! بوابة مدرسة بنها الخاصة مفتوحة — تم تجهيز ملفات التقديم للابن والابنة في الـ ٣ مباني والفصول الجديدة 🎒.',
        animPose: 'wave',
        effect: 'enroll_both',
        affectionDelta: 0,
        reputationDelta: 3,
      };
    }
    if (s.objectKind === 'fuel_pump' && wantsRefuel) {
      return {
        replyAr: 'الطلمبة اشتغلت أهي! اتفضل التفويلة وجاهز تكمل مشاويرك في الشوارع ⛽.',
        animPose: 'talk',
        effect: 'refuel_car',
        affectionDelta: 0,
        reputationDelta: 1,
      };
    }
    if (s.objectKind === 'ad_board') {
      return {
        replyAr: `شاشة الإعلانات سجّلت كلامك "${msg}" وهنور المحل بيها للزباين في الشارع فوراً! 📺✨`,
        animPose: 'wave',
        effect: 'boost_ad_promo',
        affectionDelta: 0,
        reputationDelta: 2,
      };
    }
    if (wantsFood || wantsDrink) {
      return {
        replyAr: 'ريحتنا تجيب الشبعان! اتفضل خد لقمة أو اشرب مية عشان صحتك يا معلم.',
        animPose: 'eat',
        effect: wantsDrink ? 'give_drink' : 'give_food',
        affectionDelta: 0,
        reputationDelta: 0,
      };
    }
    return {
      replyAr: `سمعناك كويس ${sender}! "${msg}" — كل حاجة في ${s.speakerNameAr} متفاعلة وتحت أمرك.`,
      animPose: 'talk',
      effect: 'none',
      affectionDelta: 0,
      reputationDelta: 1,
    };
  }

  // Human NPCs, Family, Son, Daughter, Crew, Students, Shopkeepers
  if (wantsHoldHand) {
    return {
      replyAr:
        s.targetType === 'child' || s.targetType === 'household_son' || s.targetType === 'household_daughter'
          ? 'هييه! مسكت إيدك يا بابا أهو ❤️ مش هسيبك وهنمشي سوا في كل الشوارع!'
          : `ماشي يا ${sender}! حطيت إيدي في إيدك، يلا نتحرك مع بعض على طول!`,
      animPose: 'hold_hand',
      effect: 'hold_son_hand',
      affectionDelta: 8,
      reputationDelta: 2,
    };
  }

  if (wantsLeaveParty) {
    return {
      replyAr: 'حاضر يا معلم، هقف استريح هنا لحد ما تناديني تاني 👋.',
      animPose: 'wave',
      effect: 'stop_accompany',
      affectionDelta: 0,
      reputationDelta: 0,
    };
  }

  if (wantsAccompany) {
    return {
      replyAr: 'يلا بينا! أنا جاي وراك في كل حتة — ولو ركبت العربية أو النص نقل هطلع معاك فوراً 🚐!',
      animPose: 'wave',
      effect: 'accompany_me',
      affectionDelta: 6,
      reputationDelta: 1,
    };
  }

  if (wantsBoard) {
    return {
      replyAr: 'يلا يا معلم! سواء في الكابينة قدام أو في الصندوق الخلفي للنص نقل، أنا جاهز أركب معاك!',
      animPose: 'wave',
      effect: 'board_vehicle',
      affectionDelta: 4,
      reputationDelta: 1,
    };
  }

  if (wantsEnroll) {
    if (s.targetType === 'school_staff' || s.targetType === 'student') {
      return {
        replyAr:
          'ألف مبروك يا معلم محمد! سجلنا الأولاد في مدرسة بنها الخاصة — الفصول والملاعب في الـ ٣ مباني مستنياهم 🎓.',
        animPose: 'wave',
        effect: 'enroll_both',
        affectionDelta: 4,
        reputationDelta: 4,
      };
    }
    return {
      replyAr:
        'المدارس السنة دي ممتازة، خصوصاً مدرسة بنها الخاصة ٣ مباني ٤ طوابق وملاعب واسعة! تقدر تقدم من البوابة أو الموبايل.',
      animPose: 'talk',
      effect: 'none',
      affectionDelta: 2,
      reputationDelta: 1,
    };
  }

  if (wantsDrink) {
    return {
      replyAr:
        'الحق اشرب كوباية مية ساقعة أو عصير قصب! أنا نفسي كمان كنت عطشان أوي، تسلم إيدك 🥤.',
      animPose: 'eat',
      effect: 'give_drink',
      affectionDelta: 4,
      reputationDelta: 2,
    };
  }

  if (wantsFood) {
    return {
      replyAr:
        'الجوع كافر فعلاً 😂 يلا ناكل أحلى سندوتش فول وطعمية من محل المعلم، بالهنا والشفا 🥙!',
      animPose: 'eat',
      effect: 'give_food',
      affectionDelta: 5,
      reputationDelta: 2,
    };
  }

  if (wantsComplaintOrAngry) {
    return {
      replyAr: 'حقك عليا يا معلم، ما تزعلش نفسك.. هنظبط الدنيا حالاً وترجع تضحك تاني 🙏.',
      animPose: 'argue',
      effect: 'none',
      affectionDelta: -2,
      reputationDelta: 0,
    };
  }

  if (s.targetType === 'school_staff') {
    return {
      replyAr: `أهلاً بحضرتك يا معلم محمد! "${msg}" — الطلبة في الحوش والـ ٤ طوابق ماشيين بنظام ممتاز في مدرسة بنها الخاصة.`,
      animPose: 'talk',
      effect: 'none',
      affectionDelta: 0,
      reputationDelta: 2,
    };
  }

  if (s.targetType === 'student') {
    return {
      replyAr: `أهلاً يا عمو المعلم! سمعتك بتقول "${msg}" — احنا بنلعب في حوش مدرسة بنها الخاصة وبنحب الفطار من محلك أوي! ⚽`,
      animPose: 'wave',
      effect: 'none',
      affectionDelta: 0,
      reputationDelta: 1,
    };
  }

  if (s.targetType === 'crew_member') {
    return {
      replyAr: `تحت أمرك يا معلم محمد! بخصوص "${msg}" — الشغل في المحل ماشي تمام ومستنيين تحويل الإنستا باي على الموبايل 😉💸.`,
      animPose: 'wave',
      effect: 'none',
      affectionDelta: 3,
      reputationDelta: 1,
    };
  }

  if (s.targetType === 'romance' || s.targetType === 'spouse') {
    return {
      replyAr: wantsLoveOrPraise
        ? `كلامك حلو أوي لما بتقول "${msg}" ❤️ ربنا يديم المحبة بيننا يا معلم!`
        : `سمعت كلامك "${msg}" وبصراحة عاجبني اهتمامك وطموحك 😊 تحب نطلع مشوار أو نتغدى؟`,
      animPose: wantsLoveOrPraise ? 'wave' : 'talk',
      effect: 'none',
      affectionDelta: wantsLoveOrPraise ? 10 : 6,
      reputationDelta: 2,
    };
  }

  if (s.targetType === 'household_son' || s.targetType === 'child' || s.targetType === 'household_daughter') {
    return {
      replyAr: `هييه يا بابا! "${msg}" — ينفع تمسك إيدي وتاخدني معاك في العربية ومدرسة بنها الخاصة؟ ❤️`,
      animPose: 'wave',
      effect: 'none',
      affectionDelta: 5,
      reputationDelta: 2,
    };
  }

  if (lower.includes('?')) {
    return {
      replyAr: `سؤال وجيه يا معلم! كل المحلات هنا مفتوحة وبتبيع، والناس جعانة وعايزة تاكل وتشرب. أي خدمة أنا معاك!`,
      animPose: 'talk',
      effect: 'none',
      affectionDelta: 2,
      reputationDelta: 1,
    };
  }

  return {
    replyAr: wantsLoveOrPraise
      ? `يا ميت أهلاً وسهلاً يا معلم محمد! "${msg}" — نورت الشارع كله والله 🙌.`
      : `كلام مظبوط جداً لما قلت "${msg}"! الدنيا كلها في الحارة بتشكرك على جدعنتك.`,
    animPose: wantsLoveOrPraise ? 'wave' : 'talk',
    effect: 'none',
    affectionDelta: 4,
    reputationDelta: 1,
  };
}

export function buildChatLogEntry(
  senderAr: string,
  text: string,
  isPlayer: boolean,
  clockStr: string,
): ChatMessageEntry {
  return {
    id: `msg-${Date.now().toString(36)}-${Math.floor(Math.random() * 9999)}`,
    senderAr,
    text,
    isPlayer,
    clockStr,
  };
}
