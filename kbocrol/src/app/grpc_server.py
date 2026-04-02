"""
gRPC 서버 설정
- 서버 생성 + 포트 바인딩만 담당
- Servicer 등록은 proto 컴파일 후 주석 해제
"""
import logging
from concurrent import futures

import grpc
from src.common.config import GRPC_PORT

log = logging.getLogger(__name__)


def start_grpc_server() -> grpc.Server:
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        options=[
            ("grpc.max_send_message_length",    50 * 1024 * 1024),
            ("grpc.max_receive_message_length", 50 * 1024 * 1024),
        ],
    )

    # proto 컴파일 후 아래 두 줄 주석 해제
    # from interfaces.grpc.server import KboServicer
    # from interfaces.grpc import kbo_pb2_grpc
    # kbo_pb2_grpc.add_KboServiceServicer_to_server(KboServicer(), server)

    server.add_insecure_port(f"[::]:{GRPC_PORT}")
    server.start()
    log.info(f"gRPC 서버 시작: 포트 {GRPC_PORT}")

    return server
