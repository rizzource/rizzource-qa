-- Create outlines table
CREATE TABLE public.outlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  professor TEXT NOT NULL,
  topic TEXT NOT NULL,
  year TEXT NOT NULL,
  tags TEXT[],
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.outline_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outline_id UUID NOT NULL REFERENCES public.outlines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(outline_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outline_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for outlines (everyone can read, authenticated users can insert their own)
CREATE POLICY "Anyone can view outlines"
ON public.outlines 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create outlines"
ON public.outlines 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outlines"
ON public.outlines 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outlines"
ON public.outlines 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for ratings (everyone can read, authenticated users can manage their own)
CREATE POLICY "Anyone can view outline ratings"
ON public.outline_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create ratings"
ON public.outline_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.outline_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.outline_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update outline rating averages when ratings change
CREATE OR REPLACE FUNCTION update_outline_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the outline's rating stats
  UPDATE public.outlines 
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.outline_ratings 
      WHERE outline_id = COALESCE(NEW.outline_id, OLD.outline_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.outline_ratings 
      WHERE outline_id = COALESCE(NEW.outline_id, OLD.outline_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.outline_id, OLD.outline_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update rating stats
CREATE TRIGGER update_rating_stats_on_insert
  AFTER INSERT ON public.outline_ratings
  FOR EACH ROW EXECUTE FUNCTION update_outline_rating_stats();

CREATE TRIGGER update_rating_stats_on_update
  AFTER UPDATE ON public.outline_ratings
  FOR EACH ROW EXECUTE FUNCTION update_outline_rating_stats();

CREATE TRIGGER update_rating_stats_on_delete
  AFTER DELETE ON public.outline_ratings
  FOR EACH ROW EXECUTE FUNCTION update_outline_rating_stats();

-- Function to update outline updated_at timestamp
CREATE OR REPLACE FUNCTION update_outline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for outlines updated_at
CREATE TRIGGER update_outlines_updated_at
  BEFORE UPDATE ON public.outlines
  FOR EACH ROW EXECUTE FUNCTION update_outline_updated_at();

-- Insert mock outlines data
INSERT INTO public.outlines (
  user_id, title, professor, topic, year, tags, notes, file_name, file_size, file_type, rating_avg, rating_count
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Constitutional Law I - Fundamentals',
  'Professor Smith',
  'Constitutional Law',
  '1L',
  ARRAY['constitutional law', 'fundamentals', 'civil rights'],
  'This comprehensive outline covers the fundamental principles of Constitutional Law, including the structure of government, separation of powers, and federalism. The outline begins with an overview of constitutional interpretation methods, including originalism, textualism, and living constitution theories. Key cases covered include Marbury v. Madison (judicial review), McCulloch v. Maryland (necessary and proper clause), and Gibbons v. Ogden (commerce clause). The federalism section explores the relationship between federal and state governments, covering topics like the Tenth Amendment, anti-commandeering doctrine, and conditional spending. The separation of powers section analyzes the roles and limitations of the executive, legislative, and judicial branches, including important cases like Youngstown Steel (executive power) and INS v. Chadha (legislative veto). The outline also covers individual rights under the Bill of Rights, focusing on First Amendment freedoms of speech, religion, and press. Each case is summarized with facts, holding, and reasoning, along with practical applications and exam tips. Study aids include flowcharts for constitutional analysis, comparison tables for different constitutional tests, and practice questions with detailed answers.',
  'ConLaw_I_Outline.pdf',
  2048576,
  'application/pdf',
  4.5,
  12
),
(
  '00000000-0000-0000-0000-000000000001',
  'Contracts - Offer, Acceptance & Consideration',
  'Professor Johnson',
  'Contracts',
  '1L',
  ARRAY['contracts', 'offer', 'acceptance', 'consideration'],
  'This detailed contracts outline focuses on the formation elements of contracts: offer, acceptance, and consideration. The offer section covers what constitutes a valid offer versus mere preliminary negotiations, including the objective theory of contracts and requirements for specificity. Key cases include Carlill v. Carbolic Smoke Ball Co. (unilateral contracts) and Lucy v. Zehmer (objective intent). The acceptance section analyzes the mirror image rule, mailbox rule, and battle of the forms under UCC 2-207. Important cases covered include Ever-Tite Roofing Corp. v. Green (revocation timing) and ProCD v. Zeidenberg (shrinkwrap licenses). The consideration section explores what constitutes adequate consideration, the pre-existing duty rule, and promissory estoppel. Cases include Hamer v. Sidway (legal detriment), Alaska Packers Association v. Domenico (pre-existing duty), and Kirksey v. Kirksey (gratuitous promises). The outline includes detailed analysis of the Restatement (Second) of Contracts and UCC provisions, with comparison charts showing common law versus UCC rules. Practice problems are integrated throughout, with step-by-step analysis guides for contract formation issues. Additional sections cover quasi-contract and restitution remedies, with flowcharts for determining when these alternative theories apply.',
  'Contracts_Formation_Outline.docx',
  1536000,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  4.8,
  15
),
(
  '00000000-0000-0000-0000-000000000002',
  'Torts - Negligence & Liability',
  'Professor Davis',
  'Torts',
  '1L',
  ARRAY['torts', 'negligence', 'liability', 'damages'],
  'Comprehensive torts outline covering negligence law and various forms of liability. The negligence section breaks down the four elements: duty, breach, causation, and damages. Duty analysis covers the reasonable person standard, special relationships, and limited duty rules for emotional distress and economic loss. Key cases include Palsgraf v. Long Island Railroad (proximate cause), MacPherson v. Buick Motor Co. (duty to third parties), and Tarasoff v. Regents of University of California (duty to warn). The breach section covers the Hand Formula, custom evidence, and res ipsa loquitur. Causation is divided into factual causation (but-for and substantial factor tests) and proximate causation (foreseeability and directness tests). Important causation cases include Wagon Mound (foreseeability), Polemis (directness), and Summers v. Tice (alternative liability). The damages section covers compensatory damages, including economic and non-economic losses, and the collateral source rule. The outline also covers defenses including contributory negligence, comparative negligence, and assumption of risk, with jurisdiction-by-jurisdiction comparison charts. Additional topics include vicarious liability (respondeat superior), joint and several liability, and indemnification and contribution among tortfeasors. Practice questions focus on multi-party scenarios with complex causation chains and multiple potential defendants.',
  'Torts_Negligence_Outline.pdf',
  2560000,
  'application/pdf',
  4.2,
  8
),
(
  '00000000-0000-0000-0000-000000000002',
  'Criminal Law - Elements & Defenses',
  'Professor Williams',
  'Criminal Law',
  '1L',
  ARRAY['criminal law', 'defenses', 'mens rea', 'actus reus'],
  'This criminal law outline provides comprehensive coverage of crime elements and available defenses. The actus reus section covers the requirement of voluntary acts, omissions liability, and possession crimes. Key concepts include the MPC approach versus common law distinctions, with cases like Martin v. State (involuntary acts) and People v. Beardsley (duty to act). The mens rea section analyzes the four MPC mental states (purposely, knowingly, recklessly, negligently) and their common law equivalents, including specific and general intent crimes. Important cases include Regina v. Faulkner (transferred intent) and People v. Ryan (willful blindness). The causation section covers but-for causation and proximate causation in criminal law, with analysis of intervening causes and year-and-a-day rules. The defenses section is extensive, covering justification defenses (self-defense, defense of others, defense of property) and excuse defenses (duress, necessity, insanity, intoxication). Self-defense analysis includes the reasonable person standard, duty to retreat rules, and Castle Doctrine variations. Insanity defenses compare the MNaghten rule, irresistible impulse test, Durham rule, and MPC substantial capacity test. The outline includes jurisdiction-specific variations and provides flowcharts for defense analysis. Practice problems focus on complex scenarios involving multiple defenses and overlapping doctrines.',
  'CrimLaw_Elements_Defenses.pdf',
  1800000,
  'application/pdf',
  4.6,
  10
),
(
  '00000000-0000-0000-0000-000000000003',
  'Evidence - Hearsay & Exceptions',
  'Professor Chen',
  'Evidence',
  '2L',
  ARRAY['evidence', 'hearsay', 'exceptions', 'trial practice'],
  'Detailed evidence outline focusing on hearsay rules and exceptions under Federal Rules of Evidence. The hearsay definition section covers out-of-court statements offered to prove the truth of the matter asserted, with analysis of what constitutes an "assertive" statement and the declarant requirement. Non-hearsay categories include verbal acts, effect on listener, state of mind, and impeachment uses. Key cases include Wright v. Doe d. Tatham (implied assertions) and United States v. Kearney (multiple hearsay). The exceptions section covers both Rule 803 (availability immaterial) and Rule 804 (declarant unavailable) exceptions. Rule 803 exceptions analyzed include present sense impressions, excited utterances, then-existing mental/emotional/physical condition, statements for medical diagnosis, recorded recollection, business records, and public records. Rule 804 exceptions cover former testimony, dying declarations, statements against interest, and forfeiture by wrongdoing. The outline includes detailed foundation requirements for each exception, with practice examples and common objections. Special attention is given to business records and public records exceptions, including authentication requirements and reliability standards. The residual hearsay exception (Rule 807) is covered with circuit court variations. Confrontation Clause analysis follows Crawford v. Washington and its progeny, distinguishing testimonial versus non-testimonial statements. Practice problems integrate multiple hearsay issues with realistic trial scenarios.',
  'Evidence_Hearsay_Outline.docx',
  2200000,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  4.9,
  18
),
(
  '00000000-0000-0000-0000-000000000003',
  'Administrative Law - Agency Powers',
  'Professor Rodriguez',
  'Administrative Law',
  '2L',
  ARRAY['administrative law', 'agencies', 'rulemaking', 'APA'],
  'Comprehensive administrative law outline covering agency powers and Administrative Procedure Act requirements. The rulemaking section analyzes formal versus informal rulemaking under APA sections 553 and 556-557, including notice and comment procedures, good cause exceptions, and direct final rules. Key cases include Vermont Yankee Nuclear Power Corp. v. NRDC (procedural requirements) and Motor Vehicle Manufacturers Association v. State Farm (arbitrary and capricious review). The adjudication section covers formal versus informal adjudication, due process requirements in administrative proceedings, and the right to counsel in agency hearings. Important cases include Goldberg v. Kelly (due process in benefits termination) and Mathews v. Eldridge (balancing test for procedural due process). Judicial review analysis covers standing requirements, reviewability presumptions, exhaustion doctrine, and ripeness/mootness issues. The scope of review section analyzes Chevron deference, Skidmore deference, and hard look review under different statutory contexts. Cases include Chevron U.S.A. v. NRDC (two-step deference framework) and United States v. Mead (Chevron eligibility). The outline covers delegation doctrine and nondelegation challenges, including the intelligible principle standard and major questions doctrine. Recent developments include analysis of West Virginia v. EPA and its implications for agency authority. Practice questions focus on complex multi-agency scenarios and coordination issues between federal and state administrative systems.',
  'AdminLaw_Agency_Powers.pdf',
  1950000,
  'application/pdf',
  4.3,
  7
),
(
  '00000000-0000-0000-0000-000000000004',
  'Federal Courts - Jurisdiction & Procedure',
  'Professor Thompson',
  'Federal Courts',
  '3L',
  ARRAY['federal courts', 'jurisdiction', 'procedure', 'civil procedure'],
  'Advanced federal courts outline covering subject matter jurisdiction, personal jurisdiction, and federal court procedure. The Article III section analyzes federal judicial power, including the case or controversy requirement, standing doctrine (injury, causation, redressability), and political question doctrine. Key cases include Lujan v. Defenders of Wildlife (standing requirements), Baker v. Carr (political questions), and Allen v. Wright (causation in standing). Federal question jurisdiction under 28 U.S.C. 1331 covers the well-pleaded complaint rule, arising under doctrine, and supplemental jurisdiction under 1367. Diversity jurisdiction under 1332 analyzes complete diversity requirements, citizenship determination for individuals and corporations, and amount in controversy calculations. The removal section covers 28 U.S.C. 1441-1447, including fraudulent joinder, separate and independent claims, and forum defendant rule. Personal jurisdiction analysis applies International Shoe and its progeny to federal court contexts, including nationwide service of process statutes and bulge provision under Federal Rule 4(k). The Erie doctrine section covers the Rules of Decision Act, Rules Enabling Act, and Hanna v. Plumer analysis for determining applicable law in federal court. Abstention doctrines include Pullman abstention (unclear state law), Younger abstention (ongoing state proceedings), and Colorado River abstention (parallel proceedings). Practice problems integrate multiple jurisdictional issues with complex multi-district litigation scenarios and class action complications under the Class Action Fairness Act.',
  'FedCourts_Jurisdiction.pdf',
  2800000,
  'application/pdf',
  4.7,
  13
),
(
  '00000000-0000-0000-0000-000000000004',
  'Corporate Law - Fiduciary Duties & Governance',
  'Professor Kim',
  'Corporate Law',
  '3L',
  ARRAY['corporate law', 'fiduciary duties', 'governance', 'mergers'],
  'Comprehensive corporate law outline focusing on fiduciary duties and corporate governance structures. The duty of care section analyzes the business judgment rule, its prerequisites (disinterested decision, informed basis, good faith), and exceptions including gross negligence and conflict transactions. Key cases include Smith v. Van Gorkom (procedural due care), Aronson v. Lewis (demand futility), and In re Caremark (oversight liability). The duty of loyalty section covers self-dealing transactions, corporate opportunities doctrine, and competing ventures. Important cases include Sinclair Oil Corp. v. Levien (parent-subsidiary transactions), Northeast Harbor Golf Club v. Harris (corporate opportunities), and Guth v. Loft (usurpation of opportunities). The derivative litigation section analyzes demand requirements, special litigation committees, and settlement approval procedures. Cases include Zapata Corp. v. Maldonado (SLC procedures) and Kamen v. Kemper Financial Services (federal derivative actions). Merger and acquisition analysis covers cash-out mergers, tender offers, and proxy contests, including enhanced scrutiny under Revlon and Unocal standards. The outline covers Revlon duties in change of control transactions, Unocal reasonableness and proportionality tests, and Blasius standard for board action affecting shareholder voting. Delaware General Corporation Law provisions are analyzed alongside Model Business Corporation Act alternatives. Practice problems involve complex multi-party transactions with conflicts of interest and competing fiduciary duties in merger contexts.',
  'CorpLaw_Fiduciary_Duties.docx',
  2400000,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  4.4,
  11
);

-- Insert mock ratings for the outlines
INSERT INTO public.outline_ratings (outline_id, user_id, rating) VALUES
-- Ratings for Constitutional Law outline
((SELECT id FROM public.outlines WHERE title = 'Constitutional Law I - Fundamentals'), '00000000-0000-0000-0000-000000000002', 5),
((SELECT id FROM public.outlines WHERE title = 'Constitutional Law I - Fundamentals'), '00000000-0000-0000-0000-000000000003', 4),
((SELECT id FROM public.outlines WHERE title = 'Constitutional Law I - Fundamentals'), '00000000-0000-0000-0000-000000000004', 5),
-- Ratings for Contracts outline  
((SELECT id FROM public.outlines WHERE title = 'Contracts - Offer, Acceptance & Consideration'), '00000000-0000-0000-0000-000000000003', 5),
((SELECT id FROM public.outlines WHERE title = 'Contracts - Offer, Acceptance & Consideration'), '00000000-0000-0000-0000-000000000004', 5),
-- Ratings for Torts outline
((SELECT id FROM public.outlines WHERE title = 'Torts - Negligence & Liability'), '00000000-0000-0000-0000-000000000001', 4),
((SELECT id FROM public.outlines WHERE title = 'Torts - Negligence & Liability'), '00000000-0000-0000-0000-000000000004', 4),
-- Ratings for Evidence outline
((SELECT id FROM public.outlines WHERE title = 'Evidence - Hearsay & Exceptions'), '00000000-0000-0000-0000-000000000001', 5),
((SELECT id FROM public.outlines WHERE title = 'Evidence - Hearsay & Exceptions'), '00000000-0000-0000-0000-000000000002', 5);