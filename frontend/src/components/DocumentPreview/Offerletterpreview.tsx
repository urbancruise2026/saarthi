import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import logo from "@/assets/offerLogo.jpeg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  PDFViewer,
  pdf,
} from "@react-pdf/renderer";

const fmt = (d) => {
  try {
    return format(new Date(d), "dd-MMM-yy");
  } catch {
    return d || "-";
  }
};

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logoBox: {
    width: "55%",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -70,
  },
  logoImage: {
    width: 450,
    height: 80,
    objectFit: "contain",
  },
  address: {
    width: "50%",
    textAlign: "right",
    fontSize: 9,
    color: "#444",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#bbb",
    borderBottomStyle: "dashed",
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
    fontSize: 13,
  },
  toBlock: {
    marginBottom: 10,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  underlineBold: {
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
  },
  red: {
    color: "#c0392b",
    fontFamily: "Helvetica-Bold",
  },
  green: {
    color: "#2d6a2d",
    fontFamily: "Helvetica-Bold",
  },
  // ✅ Green numbering style for sub-clauses
  clauseNum: {
    color: "#2d6a2d",
    fontFamily: "Helvetica-Bold",
  },
  introText: {
    marginBottom: 8,
    fontSize: 10,
  },
  joiningDate: {
    color: "#2d6a2d",
    textDecoration: "underline",
    fontFamily: "Helvetica-Bold",
  },
  tncLine: {
    textDecoration: "underline",
    marginBottom: 10,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#2d6a2d",
    marginBottom: 3,
  },
  clause: {
    marginBottom: 4,
    paddingLeft: 0,
  },
  clauseIndent: {
    marginBottom: 4,
    paddingLeft: 14,
  },
  note: {
    borderWidth: 1,
    borderColor: "#f5a623",
    backgroundColor: "#fffbea",
    padding: 7,
    marginTop: 10,
    fontSize: 10,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  signBox: {
    width: "45%",
  },
  signRight: {
    width: "48%",
    borderWidth: 1.5,
    borderColor: "#c0392b",
    padding: 10,
    borderRadius: 6,
    textAlign: "center",
  },
  footer: {
    marginTop: 14,
    height: 14,
    backgroundColor: "#2d6a2d",
  },
  italic: {
    fontFamily: "Helvetica-Oblique",
  },
  italicBold: {
    fontFamily: "Helvetica-BoldOblique",
  },
});

const OfferLetterPDF = ({ e }) => (
  <Document>
    <Page size="A4" style={styles.page} wrap>
      {/* ✅ Header with actual logo image */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Image src={logo} style={styles.logoImage} />
        </View>
        <View style={styles.address}>
          <Text>B-203, Laxmi Sadan, Thakur Village,</Text>
          <Text>Kandivali East, Mumbai 400101</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <Text>{fmt(e.issueDate)}</Text>
        <Text style={styles.title}>OFFER LETTER</Text>
        <Text>Ref: {e.refNo}</Text>
      </View>

      <View style={styles.toBlock}>
        <Text>To,</Text>
        <Text style={styles.bold}>
          Ms. {e.firstName} {e.lastName},
        </Text>
        <Text>{e.address}</Text>
      </View>

      <Text style={styles.introText}>
        With reference to your job application &amp; subsequent interviews with
        us, we are pleased to inform that you have been{" "}
        <Text style={styles.bold}>Selected</Text> for the position of{" "}
        <Text style={styles.bold}>{e.designation}</Text>, in{" "}
        <Text style={styles.bold}>Grade- {e.grade}</Text>, in{" "}
        <Text style={styles.bold}>{e.department} Department</Text>, based at{" "}
        <Text style={styles.bold}>{e.officeLocation} Office</Text>.{" "}
        <Text style={styles.joiningDate}>
          Joining Date is {fmt(e.joiningDate)}.
        </Text>
      </Text>

      <Text style={styles.tncLine}>
        The Terms &amp; Conditions of employment under this Offer Letter shall
        be as under:
      </Text>

      {/* 1. WORK PLACE DETAILS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. WORK PLACE DETAILS –</Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>1.1 </Text>You will be posted at{" "}
          <Text style={styles.bold}>{e.officeLocation}</Text> Office situated at
          B-203, Laxmi Sadan, Thakur Village, Kandivali E, Mumbai.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>1.2 </Text>You are assigned{" "}
          <Text style={styles.bold}>1st Shift</Text> with daily working of 6
          days/week &amp; <Text style={styles.bold}>Saturday</Text> as Week-Off.
          Work place Location, Shift, Week-Off &amp; Working Time can be changed
          as per Business requirements.
        </Text>
      </View>

      {/* 2. DUTIES & RESPONSIBILITIES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          2. DUTIES &amp; RESPONSIBILITIES –
        </Text>
        <Text style={styles.clause}>
          You shall report to the designated Manager and shall comply with all
          instructions and duties assigned by him or her. The Management
          reserves the right to assign you additional or alternative duties and
          responsibilities, whether within or outside the office premises, as
          may be deemed necessary in the interest of the business or to meet the
          requirements or exigencies of the Company.
        </Text>
      </View>

      {/* 3. TRAINING & PROBATION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. TRAINING &amp; PROBATION –</Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>3.1 </Text>You will be on Probation for
          a period of <Text style={styles.bold}>4 month</Text> from joining
          date.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>3.2 </Text>Probation Period may be
          reduced/extended based on your performance &amp; at management's
          discretion.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>3.3 </Text>After Satisfactory
          Performance during probation, the candidate will be inducted as a
          Confirmed employee on payroll &amp; all benefits will be applicable.
        </Text>
      </View>

      {/* 4. REMUNERATION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. REMUNERATION –</Text>
        <Text style={styles.clause}>
          You will be entitled to Annual Salary of{" "}
          <Text style={styles.red}>
            Rs. {Number(e.annualSalary || 0).toLocaleString("en-IN")}
          </Text>
          . Alongwith Annual Salary, you will be entitled for{" "}
          <Text style={styles.underlineBold}>Travel Allowance</Text> &amp;{" "}
          <Text style={styles.underlineBold}>Monthly Incentives</Text>.
        </Text>
      </View>

      {/* 5. LEAVES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. LEAVES –</Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>5.1 </Text>You are entitled for{" "}
          <Text style={styles.bold}>1 day off in a week</Text>. You are{" "}
          <Text style={styles.bold}>not entitled for PAID LEAVES</Text> during
          Probation Period &amp; Salary will be Deducted for Leaves taken during
          this Period. However, <Text style={styles.bold}>Holidays</Text> as per
          Company's Holiday Calendar will be provided.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>5.2 </Text>A Continuous Absence from
          Office/Duty for <Text style={styles.bold}>more than 3 days</Text>,{" "}
          <Text style={styles.underlineBold}>without prior Approval</Text> will
          be considered that you have <Text style={styles.bold}>Absconded</Text>{" "}
          from the Job &amp; will lead to{" "}
          <Text style={styles.bold}>Termination without Salary</Text>.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>5.3 </Text>Leaves beyond limits (Refer
          HR Policy) are subject to management discretion &amp; may result in
          Salary deduction or Termination.
        </Text>
      </View>

      {/* 6. EMPLOYMENT RULES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. EMPLOYMENT RULES –</Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>6.1 </Text>
          <Text style={styles.underlineBold}>
            Other Work/Other Employment/Freelancing:
          </Text>{" "}
          You are required to devote your full professional time and attention
          exclusively to your duties with the Company. You shall not engage in
          any other employment, Consultancy, freelance work or business
          activity, whether for remuneration or otherwise, during the course of
          your employment, without prior written approval from the Managing
          Director. Any violation of this condition may result in immediate
          termination of your services without notice or compensation, and
          forfeiture of any unpaid salary.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>6.2 </Text>
          <Text style={styles.underlineBold}>
            Integrity/Confidentiality/Cheating:
          </Text>{" "}
          You are expected to maintain a high level of integrity &amp;
          Confidentiality &amp; not disclose or divulge or make Public or in
          Social Media, any details of business process, Future Business plans
          or Strategies, Research work, Designs &amp; Photograph,
          Specifications, Samples or Trade Secretes, Methods, Operational
          Details, Rates or Commercials, Customer Database, Leads or Sales
          Charts, Pricing Models or Product Information, any confidential
          information with anybody outside our company. Upon found guilty, it
          will be treated seriously &amp; Company will{" "}
          <Text style={styles.bold}>
            terminate your services immediately &amp; Salary will be forfeited
          </Text>
          . If the nature &amp; magnitude of Issue/incident is severe,
          Management can seek Legal Actions against you, if required.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>6.3 </Text>
          <Text style={styles.underlineBold}>Intellectual Property-</Text> All
          Ideas, Invention, design, software &amp; all Intellectual property
          that may be developed by you or in the development of which you are
          associated while you are in employment of the Company, will solely
          &amp; absolutely belong to the Company. You are not entitled to claim
          ownership of any rights on the same.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>6.4 </Text>
          <Text style={styles.underlineBold}>
            Past Records/Declaration-
          </Text>{" "}
          This appointment is based on the information furnished in your
          application form/CV &amp; supporting documents submitted by you. In
          case, later on, if any particulars are found to be false, then this
          appointment may be held void &amp; your services may come to an end
          immediately without compensation &amp; Salary/Emoluments will be
          forfeited.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>6.5 </Text>
          <Text style={styles.underlineBold}>Office Decorum-</Text> You need to
          maintain Decorum in Office i.e. Loitering, Gossiping, Chit-chatting,
          Social Media Indulgence inside office is strictly not encouraged. If
          such behaviour persists even after warning, Disciplinary Action can be
          taken &amp; may lead to Termination without Compensation/Pending
          Salary.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>6.6 </Text>
          <Text style={styles.underlineBold}>
            Negligence &amp; Misconduct-
          </Text>{" "}
          If you commit any breach of your duties or found guilty of any gross
          negligence or misconduct even after Counselling or Warning, then
          company may terminate your services without compensation &amp; Salary.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>6.7 </Text>
          <Text style={styles.underlineBold}>
            T&amp;C of this Offer Letter-
          </Text>{" "}
          Terms &amp; Conditions of this Offer Letter will be applicable till
          your entire tenure with the Company (i.e. even after the Probation
          period is over, Till your last working day with Company)
        </Text>
      </View>

      {/* 7. EXIT PROCEDURE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. EXIT PROCEDURE-</Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>7.1 </Text>If you Leave the Company or
          gets Terminated{" "}
          <Text style={styles.italic}>
            (due to Violation of Company Policies or any misconduct,
            misbehaviour, Indiscipline, Unapproved Leaves etc.)
          </Text>{" "}
          during Probation Period, <Text style={styles.bold}>NO SALARY</Text>{" "}
          will be given for <Text style={styles.bold}>15 days</Text> of Training
          Period in your Full &amp; Final settlement.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>7.2 </Text>Due to unsatisfactory job
          performance, First You will be given Verbal Feedback, then you will be
          put in{" "}
          <Text style={styles.bold}>Performance Improvement Program (PIP)</Text>{" "}
          for <Text style={styles.bold}>15 days</Text>. If still there is no
          Improvement, then Your service shall be{" "}
          <Text style={styles.bold}>liable for Termination</Text> &amp; Salary
          for working days will be provided.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>7.3 </Text>In case you want to Leave
          your Job with the Company, you need to send a Written{" "}
          <Text style={styles.bold}>Resignation Letter</Text> on Email &amp;
          serve <Text style={styles.bold}>Notice period of 15 Days</Text>.{" "}
          <Text style={styles.bold}>
            Serving Notice Period &amp; proper Handover of your Job Profile
            Knowledge, Files &amp; Data is Mandatory
          </Text>{" "}
          to ensure that there is No disruption of your work &amp; must not lead
          to any kind of Loss to the Company.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>7.4 </Text>After Completion of Notice
          Period, you need to{" "}
          <Text style={styles.bold}>submit all the Company Assets</Text> i.e.
          Mobile Phone, Laptop or any other Company Asset to HR Department &amp;
          Handover your Data &amp; Responsibilities to the assigned person. Your
          Full &amp; final Settlement for working Days will be free within{" "}
          <Text style={styles.bold}>7 working days</Text>.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>7.5 </Text>If an employee exits{" "}
          <Text style={styles.underlineBold}>
            without serving Notice Period (Absconding)
          </Text>
          , Pending Salary, equivalent to the Notice Period will be forfeited.
          If there is In-sufficient Salary left with the Company, Employee need
          to{" "}
          <Text style={styles.bold}>
            Pay Back the Shortfall Salary Amount to Company
          </Text>
          . In case of failure to receive Pending Dues from Employee, Legal
          action may be taken against Employee to recover dues.
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>7.6 </Text>For Serious Violations
          involving Financial Fraud or Data Theft, Company will terminate the
          candidate without Salary &amp; may initiate legal action (If even if
          found Later).
        </Text>
        <Text style={styles.clauseIndent}>
          <Text style={styles.clauseNum}>7.7 </Text>Experience Letter/Relieving
          Letter won't be issued for Probation Period
        </Text>
      </View>

      {/* 8. CONSEQUENCES OF BREACH */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          8. CONSEQUENCES OF BREACH OF TERMS-
        </Text>
        <Text style={styles.clause}>
          In case of breach of any of the Terms &amp; Conditions mentioned
          above, the Company will be entitled to terminate your services without
          giving any Notice Period &amp; Compensation, Salary or any other
          amount will be Forfeited (or may get recovered from you). In case of
          grave incident/Issue resulting into severe damage to Company's
          image/Reputation or Financial issue, Management can seek Legal actions
          as well, if required, against you, if you fail to comply the above
          Terms &amp; Conditions.
        </Text>
      </View>

      {/* 9. NOTE */}
      <View style={styles.note}>
        <Text>
          <Text style={styles.bold}>9. NOTE –</Text>{" "}
          <Text style={styles.italic}>
            Employee must maintain the confidentiality of this Appointment
            Letter &amp; Not Recirculate it in
          </Text>
        </Text>
      </View>

      {/* Closing */}
      <View style={{ marginTop: 12 }}>
        <Text style={styles.bold}>
          We believe that your knowledge, skills &amp; experience will be ideal
          for our company. We hope you will enjoy your role &amp; make
          significant contribution to the overall success of the Urban Cruise.
        </Text>
        <Text style={{ marginTop: 6 }}>
          We{" "}
          <Text style={styles.green}>Welcome you to Urban Cruise Family</Text>{" "}
          &amp; look forward to a Long-Lasting &amp; fruitful Relationship.
        </Text>
      </View>

      {/* Signature */}
      <View style={styles.signatureRow}>
        <View style={styles.signBox}>
          <Text style={{ marginTop: 30 }}>____________________</Text>
          <Text style={{ marginTop: 4 }}>HR,</Text>
          <Text>Urban Cruise,</Text>
          <Text>Mumbai</Text>
        </View>
        <View style={styles.signRight}>
          <Text>
            I have read this OFFER LETTER &amp; HR POLICIES of Company
            thoroughly &amp; I am also aware of the Consequences of
            non-adherence of the same.
          </Text>
          <Text style={{ marginTop: 8 }}>
            I Agree &amp; Accept all the Terms &amp; Conditions of this OFFER
            LETTER &amp; HR Policies.
          </Text>
          <Text style={{ marginTop: 22 }}>____________________</Text>
          <Text style={{ marginTop: 4 }}>
            ({e.firstName.toUpperCase()} {e.lastName.toUpperCase()})
          </Text>
        </View>
      </View>

      <View style={styles.footer} />
    </Page>
  </Document>
);

export default function OfferLetterPreview({ employee, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const e = employee || {};

  const downloadPDF = async () => {
    try {
      setLoading(true);
      const blob = await pdf(<OfferLetterPDF e={e} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `OfferLetter_${e.firstName}_${e.lastName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full">
        <DialogHeader>
          <DialogTitle>
            Offer Letter – {e.firstName} {e.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Button onClick={downloadPDF}>
            {loading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
        <div className="w-full h-[80vh] border rounded overflow-hidden">
          <PDFViewer width="100%" height="100%">
            <OfferLetterPDF e={e} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
