import pymysql
import time
from pymysql.cursors import DictCursor
import argparse
import codecs

class DBProfiler:
    def __init__(self, host, user, password, database, port):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.port = port
        self.connection = None
        self.queries = []
        self.start_time = None

    def connect(self):
        try:
            if self.connection:
                self.connection.close()
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                cursorclass=DictCursor,
                charset='utf8mb4',
                use_unicode=True
            )
            print(f"Connexion réussie à {self.host}:{self.port}/{self.database}")
        except pymysql.Error as e:
            print(f"Erreur de connexion à la base de données: {e}")
            raise

    def start_profiling(self):
        self.start_time = time.time()
        print("Profiling started at:", time.strftime("%Y-%m-%d %H:%M:%S"))

    def stop_profiling(self):
        end_time = time.time()
        duration = end_time - self.start_time
        print(f"Profiling ended. Total duration: {duration:.2f} seconds")
        print(f"Total queries captured: {len(self.queries)}")

    def capture_queries(self, duration=60):
        self.connect()
        cursor = self.connection.cursor()
        
        try:
            cursor.execute("SET GLOBAL general_log = 'ON'")
            cursor.execute("SET GLOBAL log_output = 'TABLE'")
            
            start_time = time.time()
            while time.time() - start_time < duration:
                try:
                    cursor.execute("SELECT * FROM mysql.general_log WHERE event_time > NOW() - INTERVAL 1 SECOND")
                    for row in cursor.fetchall():
                        if row['command_type'] == 'Query':
                            self.queries.append({
                                'time': row['event_time'],
                                'query': row['argument']
                            })
                except pymysql.Error as e:
                    print(f"Erreur lors de la capture des requêtes: {e}")
                    self.connect()  # Reconnexion en cas d'erreur
                    cursor = self.connection.cursor()
                time.sleep(0.5)
        
        finally:
            try:
                cursor.execute("SET GLOBAL general_log = 'OFF'")
            except pymysql.Error as e:
                print(f"Erreur lors de la désactivation du log général: {e}")
            cursor.close()
            self.connection.close()

    def write_report(self, filename='db_profiling_report.txt'):
        with codecs.open(filename, 'w', encoding='utf-8', errors='ignore') as f:
            f.write(f"Database Profiling Report\n")
            f.write(f"Total Queries: {len(self.queries)}\n\n")
            for index, query in enumerate(self.queries, 1):
                f.write(f"Query #{index}\n")
                f.write(f"Time: {query['time']}\n")
                try:
                    f.write(f"SQL: {query['query']}\n\n")
                except UnicodeEncodeError:
                    f.write(f"SQL: [Impossible d'encoder la requête]\n\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Database Query Profiler for DDEV")
    parser.add_argument("--host", default="127.0.0.1", help="Database host")
    parser.add_argument("--user", default="root", help="Database user")
    parser.add_argument("--password", default="root", help="Database password")
    parser.add_argument("--database", default="db", help="Database name")
    parser.add_argument("--port", type=int, default=32880, help="Database port")
    parser.add_argument("--duration", type=int, default=300, help="Duration of profiling in seconds")
    
    args = parser.parse_args()

    try:
        profiler = DBProfiler(args.host, args.user, args.password, args.database, args.port)
        profiler.start_profiling()
        profiler.capture_queries(duration=args.duration)
        profiler.stop_profiling()
        profiler.write_report()
    except Exception as e:
        print(f"Une erreur s'est produite : {str(e)}")