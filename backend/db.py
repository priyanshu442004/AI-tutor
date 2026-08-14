import os
import json
import uuid
from datetime import datetime, timezone
import pyodbc
from dotenv import load_dotenv

load_dotenv()

SQL_CONN_STR = os.getenv(
    "SQL_CONN_STR",
    "DRIVER={ODBC Driver 18 for SQL Server};SERVER=legal.c5k02aqsif0f.ap-south-1.rds.amazonaws.com,1433;DATABASE=CLAOnline;UID=admin;PWD=Legal007__;Encrypt=yes;TrustServerCertificate=yes;"
)

def get_db_connection():
    return pyodbc.connect(SQL_CONN_STR)

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AcceptedGoldenDatasets')
            BEGIN
                CREATE TABLE AcceptedGoldenDatasets (
                    id VARCHAR(100) PRIMARY KEY,
                    section_name NVARCHAR(255) NOT NULL,
                    book_id VARCHAR(100) NOT NULL DEFAULT 'legal',
                    pdf_filename NVARCHAR(255),
                    dataset_json NVARCHAR(MAX) NOT NULL,
                    created_at DATETIME2 DEFAULT GETUTCDATE()
                )
            END
        """)
        conn.commit()
        conn.close()
        print("MSSQL AcceptedGoldenDatasets table verified.")
    except Exception as e:
        print(f"MSSQL Init Error: {e}")

# Initialize table on import
init_db()

def save_accepted_golden_dataset(section_name: str, dataset_json: dict, book_id: str = "legal", pdf_filename: str = ""):
    record_id = f"sec-{uuid.uuid4().hex[:8]}"
    clean_section = section_name.strip() or "Section 1.1"
    json_str = json.dumps(dataset_json, ensure_ascii=False)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if section_name already exists for this book_id, update if so
    cursor.execute("SELECT id FROM AcceptedGoldenDatasets WHERE book_id = ? AND section_name = ?", (book_id, clean_section))
    row = cursor.fetchone()
    
    if row:
        record_id = row[0]
        cursor.execute("""
            UPDATE AcceptedGoldenDatasets
            SET dataset_json = ?, pdf_filename = ?, created_at = GETUTCDATE()
            WHERE id = ?
        """, (json_str, pdf_filename, record_id))
    else:
        cursor.execute("""
            INSERT INTO AcceptedGoldenDatasets (id, section_name, book_id, pdf_filename, dataset_json)
            VALUES (?, ?, ?, ?, ?)
        """, (record_id, clean_section, book_id, pdf_filename, json_str))
        
    conn.commit()
    conn.close()
    return record_id

def get_accepted_sections(book_id: str = "legal"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, section_name, pdf_filename, dataset_json, created_at
            FROM AcceptedGoldenDatasets
            WHERE book_id = ?
            ORDER BY created_at ASC
        """, (book_id,))
        rows = cursor.fetchall()
        conn.close()
        
        sections = []
        for r in rows:
            try:
                ds = json.loads(r[3])
            except Exception:
                ds = {}
            sections.append({
                "id": r[0],
                "section_name": r[1],
                "pdf_filename": r[2] or "",
                "dataset": ds,
                "created_at": r[4].isoformat() if r[4] else ""
            })
        return sections
    except Exception as e:
        print(f"Error fetching accepted sections: {e}")
        return []

def delete_accepted_section(section_id: str):
    """Deletes an accepted dataset section from MSSQL database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM AcceptedGoldenDatasets WHERE id = ? OR section_name = ?", (section_id, section_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def update_accepted_section(section_id: str, section_name: str, dataset_json: dict):
    """Updates/replaces an accepted dataset section in MSSQL database."""
    json_str = json.dumps(dataset_json, ensure_ascii=False)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE AcceptedGoldenDatasets
        SET section_name = ?, dataset_json = ?, created_at = GETUTCDATE()
        WHERE id = ? OR section_name = ?
    """, (section_name, json_str, section_id, section_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def get_legal_book_structure():
    """
    Dynamically builds the 'Legal' book structure strictly from accepted golden dataset sections in MSSQL.
    No hardcoded sections — sections exist only when accepted by Admin.
    """
    accepted_sections = get_accepted_sections(book_id="legal")
    
    topics = []
    for idx, sec in enumerate(accepted_sections):
        s_name = sec["section_name"]
        ds = sec["dataset"]
        meta = ds.get("metadata", {})
        sub_topics = ds.get("sub_topics") or ds.get("subtopics") or ds.get("sub_topic_list") or []
        
        s_note = sub_topics[0].get("short_note") if (sub_topics and isinstance(sub_topics, list) and isinstance(sub_topics[0], dict) and sub_topics[0].get("short_note")) else ds.get("short_note")
        l_note = sub_topics[0].get("long_note") if (sub_topics and isinstance(sub_topics, list) and isinstance(sub_topics[0], dict) and sub_topics[0].get("long_note")) else ds.get("long_note")
        
        if sub_topics and isinstance(sub_topics, list):
            for sub_idx, sub in enumerate(sub_topics):
                if not isinstance(sub, dict):
                    continue
                t_title = sub.get("sub_topic_name") or sub.get("topic_title") or f"{s_name} Sub-Topic {sub_idx + 1}"
                t_id = s_name if len(sub_topics) == 1 else f"{s_name}.{sub_idx + 1}"
                
                cur_short = sub.get("short_note") or s_note or "Key statutory notes."
                cur_long = sub.get("long_note") or l_note or "Comprehensive legal synthesis."
                
                topic_obj = {
                    "topic_id": t_id,
                    "topic_title": t_title,
                    "sub_title": f"Official CLA Legal Golden Dataset for {t_title}",
                    "readTime": "10 min read",
                    "difficulty": "Intermediate",
                    "examWeightage": "High",
                    "concept": sub.get("concept") or ds.get("concept") or f"Core statutory analysis and legal framework for {t_title}.",
                    "prerequisites": sub.get("prerequisites") or ["Basic Legal Textbook Knowledge"],
                    "explanation": sub.get("explanation") or cur_long or f"Comprehensive pedagogical legal analysis for {t_title}.",
                    "examples": sub.get("examples") or [{"title": "Statutory Application", "content": "Practical case study scenario."}],
                    "flashcards": sub.get("flashcards") or [{"question": f"What is the key rule under {t_title}?", "answer": "Core statutory principle applies."}],
                    "practice_problems": sub.get("practice_problems") or [{"type": "MCQ", "question": f"Which section governs {t_title}?", "options": ["a) Statutory Provision", "b) General Rule"], "answer": "a)", "explanation": "Statutory rule applies."}],
                    "misconceptions": sub.get("common_misconceptions") or sub.get("misconceptions") or [{"misconception": "Common legal myth", "correction": "Actual statutory interpretation"}],
                    "assessment": sub.get("assessment") or {"self_check_questions": ["What is the primary statutory objective?"], "difficulty": "Intermediate", "exam_weightage": "High"},
                    "short_notes": cur_short if isinstance(cur_short, list) else [cur_short],
                    "long_notes": cur_long,
                    "short_note": cur_short,
                    "long_note": cur_long
                }
                topics.append(topic_obj)
        else:
            topic_title = meta.get("chapter_topic") or meta.get("chapter_name") or f"Legal Study Guide {s_name}"
            cur_short = s_note or "Key statutory notes."
            cur_long = l_note or "Comprehensive legal synthesis."
            topic_obj = {
                "topic_id": s_name,
                "topic_title": topic_title,
                "sub_title": f"Official CLA Legal Golden Dataset for {s_name}",
                "readTime": "10 min read",
                "difficulty": "Intermediate",
                "examWeightage": "High",
                "concept": ds.get("concept") or f"Core statutory analysis and legal framework for {s_name}.",
                "prerequisites": ds.get("prerequisites") or ["Basic Legal Textbook Knowledge"],
                "explanation": ds.get("long_note") or f"Comprehensive pedagogical legal analysis for {s_name}.",
                "examples": ds.get("examples") or [{"title": "Statutory Application", "content": "Practical case study scenario."}],
                "flashcards": ds.get("flashcards") or [{"question": f"What is the key rule under {s_name}?", "answer": "Core statutory principle applies."}],
                "practice_problems": ds.get("practice_problems") or [{"type": "MCQ", "question": f"Which section governs {s_name}?", "options": ["a) Statutory Provision", "b) General Rule"], "answer": "a)", "explanation": "Statutory rule applies."}],
                "misconceptions": ds.get("common_misconceptions") or ds.get("misconceptions") or [{"misconception": "Common legal myth", "correction": "Actual statutory interpretation"}],
                "assessment": ds.get("assessment") or {"self_check_questions": ["What is the primary statutory objective?"], "difficulty": "Intermediate", "exam_weightage": "High"},
                "short_notes": cur_short if isinstance(cur_short, list) else [cur_short],
                "long_notes": cur_long,
                "short_note": cur_short,
                "long_note": cur_long
            }
            topics.append(topic_obj)

    return {
        "id": "legal",
        "title": "Legal",
        "author": "Corporate Law Authority (CLA)",
        "category": "Corporate Law & Practice",
        "edition": "2026 Legal Edition",
        "description": "Official CLA Legal Textbook & Reference Guide. Powered by Pinecone cla-online vector store and verified MSSQL Golden Datasets.",
        "total_pages": 450,
        "cover_gradient": "from-amber-600 to-yellow-800",
        "total_chunks": 17592,
        "is_legal": True,
        "stats": {
            "modules": 1 if topics else 0,
            "chapters": len(topics),
            "topics": len(topics),
            "totalHours": f"{max(1, len(topics) * 2)} hrs"
        },
        "modules": [
            {
                "module_id": "MOD_LEGAL_1",
                "module_title": "CLA Legal Sections & Golden Study Guides",
                "topics": topics
            }
        ] if topics else [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
