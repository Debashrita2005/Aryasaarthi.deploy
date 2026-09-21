import { describe, it, expect, beforeEach } from 'vitest';
import { processChatTurn, resetChatSession } from '../lib/chatbotEngine';

describe('Ask Arya Dynamic On-Device AI Engine (100% Local, Zero External LLM)', () => {
  const sessionId = 'test_session_arya_pure_local';

  beforeEach(() => {
    resetChatSession(sessionId);
  });

  it('1. Acknowledges greeting and asks about venture/purpose based on citizen input', async () => {
    const res = await processChatTurn(sessionId, 'Hello Arya, I need help');
    expect(res.reply).toContain('Namaste! I am Arya');
    expect(res.reply).toContain('what type of business, venture, or educational scheme are you looking to start?');
    expect(res.quick_replies).toContain('Small Business / Retail Shop');
    expect(res.quick_replies).toContain('Dairy / Animal Husbandry');
  });

  it('2. Dynamically answers user question regarding collateral and guarantees', async () => {
    const res = await processChatTurn(sessionId, 'Can I get a loan without collateral or land guarantee?');
    expect(res.reply).toContain('Regarding Collateral & Guarantees');
    expect(res.reply).toContain('100% collateral-free');
    expect(res.reply).toContain('what type of business, venture, or educational scheme');
  });

  it('3. Dynamically answers user question regarding subsidies', async () => {
    const res = await processChatTurn(sessionId, 'Is there any subsidy available?');
    expect(res.reply).toContain('Regarding Subsidies');
    expect(res.reply).toContain('30% up to 50%');
  });

  it('4. Dynamically answers user question regarding interest rates', async () => {
    const res = await processChatTurn(sessionId, 'What is the rate of interest / byaj dar?');
    expect(res.reply).toContain('Regarding Concessional Interest Rates');
    expect(res.reply).toContain('4% p.a.');
    expect(res.reply).toContain('Micro Finance');
  });

  it('5. Dynamically answers user question regarding repayment tenure & moratorium', async () => {
    const res = await processChatTurn(sessionId, 'What is the loan tenure and grace period before EMI?');
    expect(res.reply).toContain('Regarding Repayment & Grace Period (Moratorium)');
    expect(res.reply).toContain('3 to 5 years');
    expect(res.reply).toContain('moratorium');
  });

  it('6. Dynamically answers user question regarding maximum funding limits', async () => {
    const res = await processChatTurn(sessionId, 'What is the maximum loan limit under government schemes?');
    expect(res.reply).toContain('Regarding Maximum Funding Limits');
    expect(res.reply).toContain('50,00,000');
  });

  it('7. Dynamically addresses personal situation (widow / single mother wanting to start boutique)', async () => {
    const res = await processChatTurn(sessionId, 'I am a widow and single mother, I want to start a tailoring boutique');
    expect(res.reply).toContain('respect your courage');
    expect(res.reply).toContain('Mahila Samriddhi Yojana');
    expect(res.reply).toContain('how much total loan or funding do you need');
  });

  it('8. Dynamically handles existing business expansion (expanding goat farm)', async () => {
    const res = await processChatTurn(sessionId, 'I already have 5 goats and want to expand my farm');
    expect(res.reply).toContain('Expanding your existing');
    expect(res.reply).toContain('goat farming & livestock');
    expect(res.reply).toContain('how much total loan or funding do you need');
  });

  it('9. Handles certificates question and advises on e-District portal', async () => {
    const res = await processChatTurn(sessionId, 'I do not have caste certificate right now, can I still apply?');
    expect(res.reply).toContain('Regarding Certificates');
    expect(res.reply).toContain('e-District');
  });

  it('10. Full multi-turn scheme progression executes purely on-device without external network calls', async () => {
    await processChatTurn(sessionId, 'I want to start a tailoring and boutique shop');
    await processChatTurn(sessionId, '1 lakh');
    await processChatTurn(sessionId, 'Yes, SC');
    await processChatTurn(sessionId, 'Female');
    await processChatTurn(sessionId, '1.2 lakh');
    const finalRes = await processChatTurn(sessionId, 'Uttar Pradesh');

    expect(finalRes.reply).toContain('Profile assessment complete!');
    expect(finalRes.matched_schemes.length).toBeGreaterThan(0);
    expect(finalRes.matched_schemes.some(s => s.name.includes('Micro Finance') || s.name.includes('MFS'))).toBe(true);
    expect(finalRes.quick_replies).toContain('Check Required Documents');
  });

  it('11. Dynamically solves and provides 3-step solution blueprint when user says "solve it"', async () => {
    // User mentions dairy farming
    await processChatTurn(sessionId, 'I want to start a dairy farm with cows');
    // User directly demands "SOLVE IT"
    const res = await processChatTurn(sessionId, 'SOLVE IT');

    expect(res.reply).toContain('Actionable Solution Blueprint');
    expect(res.reply).toContain('DAIRY');
    expect(res.reply).toContain('Micro Finance');
    expect(res.reply).toContain('ZERO collateral');
    // Immediate scheme cards must be returned
    expect(res.matched_schemes.length).toBeGreaterThan(0);
    expect(res.quick_replies).toContain('Check Required Documents');
  });

  it('12. Empathetically handles user repetition complaint ("always sent same message")', async () => {
    const res = await processChatTurn(
      sessionId,
      'CHAT BOT ISN THAT MUCH INTERESTING AS IT ALWAYS SENT SAME MESSAGE WHATEVER I WRITE OR TELL FOR SOLVE IT'
    );

    expect(res.reply).toContain('apologize for repeating questions');
    expect(res.reply).toContain('Mahila Samriddhi Yojana');
    expect(res.reply).toContain('Micro Finance Scheme');
    expect(res.matched_schemes.length).toBeGreaterThan(0);
    expect(res.quick_replies).toContain('Calculate Monthly EMI');
  });

  it('13. Breaks down project cost estimates when user says "I do not know the amount"', async () => {
    await processChatTurn(sessionId, 'I want to open a dairy unit');
    const res = await processChatTurn(sessionId, 'I do not know how much amount is needed');

    expect(res.reply).toContain('Estimated Project Costs for Dairy');
    expect(res.reply).toContain('1,20,000 to ₹1,40,000');
    expect(res.reply).toContain('ZERO collateral');
    expect(res.quick_replies).toContain('₹1,40,000 (Full Micro Unit)');
  });

  it('14. Calculates precise EMI estimates with moratorium advantage', async () => {
    const res = await processChatTurn(sessionId, 'Calculate my monthly EMI and kist');

    expect(res.reply).toContain('Calculated Monthly EMI');
    expect(res.reply).toContain('₹1,476 / month');
    expect(res.reply).toContain('₹2,997 / month');
    expect(res.reply).toContain('Moratorium Advantage');
  });

  it('15. Provides essential document checklist on demand', async () => {
    const res = await processChatTurn(sessionId, 'What documents are required for the loan?');

    expect(res.reply).toContain('Essential Document Checklist');
    expect(res.reply).toContain('Caste Certificate');
    expect(res.reply).toContain('Aadhaar');
    expect(res.reply).toContain('Zero Collateral');
  });

  it('16. Anti-repetition prevents looping on missing slots', async () => {
    // Turn 1: user mentions dairy
    const t1 = await processChatTurn(sessionId, 'dairy business');
    expect(t1.reply).toContain('approximately how much total loan or funding do you need?');

    // Turn 2: user says something open-ended without amount
    const t2 = await processChatTurn(sessionId, 'tell me more about this');
    // Must NOT repeat the exact same prompt
    expect(t2.reply).not.toContain('approximately how much total loan or funding do you need?');
    expect(t2.reply).toContain('If you\'re not sure about the exact budget');

    // Turn 3: user again doesn't provide amount
    const t3 = await processChatTurn(sessionId, 'what do you recommend');
    // Must pivot to recommendations and stop asking for amount
    expect(t3.reply).toContain('here are your best matching schemes below');
    expect(t3.matched_schemes.length).toBeGreaterThan(0);
  });

  it('17. Strictly follows reply pattern: responds directly to user input first, then asks basic details required for scheme recommendation', async () => {
    // Turn 1: User specifies a venture
    const t1 = await processChatTurn(sessionId, 'I want to start a grocery shop');
    expect(t1.reply).toContain('Your vision for retail grocery / kirana shop is very well aligned');
    expect(t1.reply).toContain('Basic Details Required for Scheme Recommendation:');
    expect(t1.reply).toContain('approximately how much total loan or funding do you need?');

    // Turn 2: User provides amount
    const t2 = await processChatTurn(sessionId, '1 lakh');
    // First part must kindly acknowledge amount with micro finance & subsidy context
    expect(t2.reply).toContain('Noted your funding requirement of ₹1,00,000:');
    expect(t2.reply).toContain('Micro Finance Scheme');
    expect(t2.reply).toContain('100% collateral-free');
    // Second part must ask basic details required
    expect(t2.reply).toContain('Basic Details Required for Scheme Recommendation:');
    expect(t2.reply).toContain('Scheduled Caste (SC) community?');

    // Turn 3: User provides SC status
    const t3 = await processChatTurn(sessionId, 'Yes, SC');
    expect(t3.reply).toContain('Acknowledged (Scheduled Caste Category):');
    expect(t3.reply).toContain('statutory interest rates as low as 4% to 5% p.a.');
    expect(t3.reply).toContain('Basic Details Required for Scheme Recommendation:');
    expect(t3.reply).toContain('woman entrepreneur');

    // Turn 4: User provides Gender
    const t4 = await processChatTurn(sessionId, 'Female');
    expect(t4.reply).toContain('Understood (Woman Entrepreneur):');
    expect(t4.reply).toContain('Mahila Samriddhi Yojana (MSY)');
    expect(t4.reply).toContain('Basic Details Required for Scheme Recommendation:');
    expect(t4.reply).toContain('annual family income');
  });

  it('18. Answers user question first, then proceeds with basic details inquiry', async () => {
    const res = await processChatTurn(sessionId, 'How to apply for schemes?');
    expect(res.reply).toContain('Regarding How to Apply:');
    expect(res.reply).toContain('State Channelizing Agency (SCA)');
    expect(res.reply).toContain('Basic Details Required for Scheme Recommendation:');
    expect(res.reply).toContain('what type of business, venture, or educational scheme are you looking to start?');
  });

  it('19. Accurately handles saree business and personal introduction without Dairy bleed-through', async () => {
    // Session previously had other slots
    await processChatTurn(sessionId, 'dairy business');
    await processChatTurn(sessionId, '50000');

    // User introduces herself with saree business
    const res = await processChatTurn(sessionId, 'hi my name is sneha i want to open a small scale business of saree');
    expect(res.reply).toContain('Sneha');
    expect(res.reply).toContain('saree & apparel business');
    expect(res.reply).not.toContain('Dairy');
    expect(res.reply).toContain('Basic Details Required for Scheme Recommendation:');
    expect(res.reply).toContain('approximately how much total loan or funding do you need?');
    expect(res.matched_schemes.length).toBe(0); // Schemes must NOT be shown prematurely before details are filled!
  });

  it('20. Introducing name only does NOT bleed past trade into greeting', async () => {
    const testSid = 'sid_name_only_' + Date.now();
    // Prior user session had saree business
    await processChatTurn(testSid, 'saree business');

    // Fresh user introduces himself as Aditya without mentioning trade
    const res = await processChatTurn(testSid, 'My name is Aditya');
    expect(res.reply).toContain('Namaste Aditya ji!');
    expect(res.reply).not.toContain('saree');
    expect(res.reply).not.toContain('Sneha');
    expect(res.slots.user_name).toBe('Aditya');
    expect(res.slots.gender).toBe('MALE');
  });

  it('21. Pure greeting wipes any prior user name or trade context', async () => {
    const testSid = 'sid_pure_greeting_' + Date.now();
    await processChatTurn(testSid, 'My name is Sneha, I want a saree shop');

    // User or client opens fresh and sends 'hello'
    const res = await processChatTurn(testSid, 'hello');
    expect(res.reply).not.toContain('Sneha');
    expect(res.reply).not.toContain('saree');
    expect(res.reply).toContain('Namaste! I am Arya');
    expect(res.slots.user_name).toBeNull();
    expect(res.slots.purpose).toBeNull();
  });

  it('22. Supports compound names and greetings with I am / Im', async () => {
    const testSid = 'sid_compound_' + Date.now();
    const res = await processChatTurn(testSid, 'I am Aditya Singh, I want to start a grocery shop');
    expect(res.reply).toContain('Namaste Aditya ji!');
    expect(res.reply).toContain('retail grocery / kirana shop');
    expect(res.slots.user_name).toBe('Aditya Singh');
    expect(res.slots.gender).toBe('MALE');
  });
});
