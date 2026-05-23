// ─── PDF Scorecard Export ─────────────────────────────────────────────────
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GREEN = [22, 163, 74];
const DARK = [17, 24, 39];
const GRAY = [107, 114, 128];
const LIGHT_GRAY = [243, 244, 246];
const WHITE = [255, 255, 255];
const GOLD = [234, 179, 8];
const RED = [220, 38, 38];

export function exportMatchPDF(match) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { setup, innings, result, playerOfMatch } = match;

  const pageW = doc.internal.pageSize.getWidth();
  let y = 0;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 35, 'F');

  // Cricket ball decoration
  doc.setFillColor(...RED);
  doc.circle(pageW - 20, 10, 8, 'F');
  doc.setDrawColor(255, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(pageW - 20, 2, pageW - 20, 18);
  doc.line(pageW - 28, 10, pageW - 12, 10);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AI CRICKET SCORER', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${setup.teamA} vs ${setup.teamB}`, 14, 21);
  doc.text(`${setup.venue || 'Unknown Venue'} | ${setup.date || ''} | ${setup.matchType || 'T20'}`, 14, 27);

  y = 44;

  // ── Toss & Result Info ───────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y - 5, pageW - 28, 18, 3, 3, 'F');

  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOSS:', 18, y + 1);
  doc.setFont('helvetica', 'normal');
  doc.text(`${setup.tossWinner} won the toss and elected to ${setup.tossDecision}`, 32, y + 1);

  if (result) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GREEN);
    doc.text('RESULT:', 18, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(result, 32, y + 8);
  }

  if (playerOfMatch) {
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.text('PLAYER OF THE MATCH:', pageW / 2, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GOLD[0] > 200 ? [180, 140, 0] : GOLD);
    doc.text(playerOfMatch, pageW / 2, y + 8);
  }

  y += 22;

  // ── Each Innings ─────────────────────────────────────────────────────────
  innings.forEach((inn, idx) => {
    if (y > 250) { doc.addPage(); y = 15; }

    // Innings header
    doc.setFillColor(...DARK);
    doc.roundedRect(14, y, pageW - 28, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${inn.battingTeam} - ${inn.score}/${inn.wickets} (${inn.overs}.${inn.balls} ov)`, 18, y + 7);

    const rrText = `RR: ${inn.score > 0 ? ((inn.score / (inn.overs * 6 + inn.balls)) * 6).toFixed(2) : '0.00'}`;
    doc.setFontSize(9);
    doc.text(rrText, pageW - 30, y + 7);

    y += 14;

    // Batting table
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.text('BATTING', 14, y);
    y += 3;

    const batHead = [['Batter', 'Dismissal', 'R', 'B', '4s', '6s', 'SR']];
    const batRows = (inn.batsmen || []).map(b => [
      b.name,
      b.dismissal || 'not out',
      String(b.runs),
      String(b.balls),
      String(b.fours),
      String(b.sixes),
      String(b.strikeRate || ((b.balls > 0) ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0')),
    ]);

    // Extras row
    const extTot = inn.extras ? inn.extras.total : 0;
    const extDetail = inn.extras
      ? `(W ${inn.extras.wides}, NB ${inn.extras.noBalls}, B ${inn.extras.byes}, LB ${inn.extras.legByes})`
      : '';
    batRows.push(['Extras', extDetail, String(extTot), '', '', '', '']);
    batRows.push(['TOTAL', `${inn.wickets} wkts, ${inn.overs}.${inn.balls} ov`, String(inn.score), '', '', '', '']);

    doc.autoTable({
      startY: y,
      head: batHead,
      body: batRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5, textColor: DARK },
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 55 },
        2: { cellWidth: 10, halign: 'right' },
        3: { cellWidth: 10, halign: 'right' },
        4: { cellWidth: 10, halign: 'right' },
        5: { cellWidth: 10, halign: 'right' },
        6: { cellWidth: 16, halign: 'right' },
      },
      didParseCell: function (data) {
        if (data.row.index === batRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = LIGHT_GRAY;
        }
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 4;

    // Bowling table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('BOWLING', 14, y);
    y += 3;

    const bowlHead = [['Bowler', 'O', 'M', 'R', 'W', 'Econ', 'WD', 'NB']];
    const bowlRows = (inn.bowlers || []).map(b => [
      b.name,
      String(b.overs),
      String(b.maidens),
      String(b.runs),
      String(b.wickets),
      String(b.economy || 0),
      String(b.wides || 0),
      String(b.noBalls || 0),
    ]);

    doc.autoTable({
      startY: y,
      head: bowlHead,
      body: bowlRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5, textColor: DARK },
      headStyles: { fillColor: [30, 41, 59], textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 12, halign: 'right' },
        2: { cellWidth: 12, halign: 'right' },
        3: { cellWidth: 12, halign: 'right' },
        4: { cellWidth: 12, halign: 'right' },
        5: { cellWidth: 16, halign: 'right' },
        6: { cellWidth: 12, halign: 'right' },
        7: { cellWidth: 12, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 4;

    // Fall of wickets
    if (inn.fallOfWickets && inn.fallOfWickets.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('FALL OF WICKETS:', 14, y);
      doc.setFont('helvetica', 'normal');
      const fowText = inn.fallOfWickets
        .map(f => `${f.wicket}-${f.score} (${f.batsman}, ${f.overs} ov)`)
        .join('  |  ');
      const lines = doc.splitTextToSize(fowText, pageW - 28);
      doc.text(lines, 14, y + 4);
      y += 4 + lines.length * 4 + 4;
    }

    y += 4;
  });

  // ── Commentary (first 20 balls) ──────────────────────────────────────────
  if (innings[0]?.commentary?.length > 0) {
    if (y > 240) { doc.addPage(); y = 15; }

    doc.setFillColor(...DARK);
    doc.roundedRect(14, y, pageW - 28, 8, 2, 2, 'F');
    doc.setTextColor(WHITE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BALL-BY-BALL HIGHLIGHTS', 18, y + 5.5);
    y += 12;

    const allCommentary = [
      ...(innings[0]?.commentary || []),
      ...(innings[1]?.commentary || []),
    ].slice(0, 25);

    allCommentary.forEach((c, i) => {
      if (y > 275) { doc.addPage(); y = 15; }
      doc.setTextColor(...(i % 2 === 0 ? DARK : GRAY));
      doc.setFontSize(8);
      doc.setFont('helvetica', i % 2 === 0 ? 'normal' : 'normal');
      const lines = doc.splitTextToSize(`${c.ball}  ${c.text}`, pageW - 30);
      doc.text(lines, 16, y);
      y += lines.length * 4 + 1;
    });

    y += 4;
  }

  // ── AI Analysis ──────────────────────────────────────────────────────────
  if (match.aiAnalysis) {
    if (y > 220) { doc.addPage(); y = 15; }

    doc.setFillColor(34, 197, 94);
    doc.roundedRect(14, y, pageW - 28, 8, 2, 2, 'F');
    doc.setTextColor(WHITE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('AI MATCH ANALYSIS', 18, y + 5.5);
    y += 12;

    const ai = match.aiAnalysis;
    const sections = [
      { label: 'Match Summary', text: ai.summary },
      { label: 'Turning Point', text: ai.turningPoint },
      { label: 'Pressure Moment', text: ai.pressureMoment },
      { label: 'Best Performer', text: ai.bestPerformer },
      { label: 'Player of the Match', text: `${ai.suggestedPOM} — ${ai.suggestedPOMStats}` },
    ];

    sections.forEach(sec => {
      if (!sec.text || y > 270) return;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(sec.label + ':', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      const lines = doc.splitTextToSize(sec.text, pageW - 28);
      doc.text(lines, 14, y + 4);
      y += 4 + lines.length * 4 + 4;
    });
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(0, 287, pageW, 10, 'F');
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by AI Cricket Scorer | github.com/your-username/ai-cricket-scorer', 14, 293);
    doc.text(`Page ${i} of ${totalPages}`, pageW - 20, 293, { align: 'right' });
  }

  // Save
  const filename = `scorecard-${setup.teamA?.replace(/\s/g, '_')}-vs-${setup.teamB?.replace(/\s/g, '_')}-${setup.date || 'match'}.pdf`;
  doc.save(filename);
}
